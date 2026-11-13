const adminRepository = require('./admin.repository');
const { removeQuestion } = require('../board/board.service');
const { findWritableMember } = require('../member/mypage.service');
const { REPORT_TARGET_TYPE } = require('../report/report.constants');
const { REPORT_STATUS, REPORT_ACTION, ACTION_RESULT_STATUS } = require('./admin.constants');
const { getOffset, toPage } = require('../utils/page');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { withTransaction } = require('../utils/transaction');

function toReportSummary(row) {
  return {
    reportId: row.reportId,
    targetType: row.targetType,
    targetId: row.targetId,
    questionId: row.questionId,
    targetTitle: row.targetTitle,
    targetDeleted: Boolean(row.targetDeleted),
    reporter: { memberId: row.reporterId, nickname: row.reporterNickname },
    targetWriter: { memberId: row.targetWriterId, nickname: row.targetWriterNickname },
    reason: row.reason,
    reasonDetail: row.reasonDetail,
    status: row.status,
    createdAt: row.createdAt,
  };
}

// 신고 목록 (REQ-ADMIN-001). 신고 1건이 한 행이고, reportCount는 같은 대상에 쌓인 전체 신고 수다.
async function getReports({ page, size, sort, targetType, status }) {
  const condition = { targetType, status };
  const [rows, totalElements] = await Promise.all([
    adminRepository.findReports(condition, { sort, limit: size, offset: getOffset(page, size) }),
    adminRepository.countReports(condition),
  ]);
  const content = rows.map((row) => ({ ...toReportSummary(row), reportCount: Number(row.reportCount) }));
  return toPage(content, page, size, Number(totalElements));
}

// 신고 상세 (REQ-ADMIN-001). 대상이 이미 삭제됐어도 내용을 보여준다.
async function getReport(reportId) {
  const row = await adminRepository.findReportById(reportId);
  if (row === null) {
    throw new AppError(ErrorCode.REPORT_NOT_FOUND);
  }
  return { ...toReportSummary(row), targetContent: row.targetContent };
}

// 대상 숨김 처리. 이미 삭제된 대상은 그대로 둔다 (docs/03-db-open-questions.md 삭제 정책).
async function hideTarget(conn, { targetType, targetId }, adminId) {
  if (targetType === REPORT_TARGET_TYPE.QUESTION) {
    const deleted = await adminRepository.findQuestionDeletedForUpdate(conn, targetId);
    if (deleted === false) {
      // 딸린 답변·답글까지 숨기는 질문 삭제(#41)를 관리자 권한으로 같은 트랜잭션에서 호출한다.
      await removeQuestion(conn, targetId, { memberId: adminId, isAdmin: true });
    }
    return;
  }
  const deleted = await adminRepository.findAnswerDeletedForUpdate(conn, targetId);
  if (deleted === false) {
    await adminRepository.softDeleteAnswerWithReplies(conn, targetId);
  }
}

// 신고 처리 (REQ-ADMIN-002). 같은 대상의 다른 PENDING 신고도 함께 같은 상태로 바꾼다.
async function processReport(adminId, reportId, action) {
  await findWritableMember(adminId);

  return withTransaction(async (conn) => {
    const report = await adminRepository.findReportForUpdate(conn, reportId);
    if (report === null) {
      throw new AppError(ErrorCode.REPORT_NOT_FOUND);
    }
    if (report.status !== REPORT_STATUS.PENDING) {
      throw new AppError(ErrorCode.REPORT_ALREADY_PROCESSED);
    }

    if (action === REPORT_ACTION.DELETE_TARGET) {
      await hideTarget(conn, report, adminId);
    }
    const status = ACTION_RESULT_STATUS[action];
    const processedCount = await adminRepository.processPendingReports(conn, {
      targetType: report.targetType,
      targetId: report.targetId,
      status,
      adminId,
    });
    return { reportId: report.reportId, status, processedCount };
  });
}

module.exports = { getReports, getReport, processReport };
