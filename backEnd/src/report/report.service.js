const reportRepository = require('./report.repository');
const { findWritableMember } = require('../member/mypage.service');
const { REPORT_TARGET_TYPE } = require('./report.constants');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');

const TARGET_CHECKS = Object.freeze({
  [REPORT_TARGET_TYPE.QUESTION]: { exists: reportRepository.existsQuestion, notFound: ErrorCode.QUESTION_NOT_FOUND },
  [REPORT_TARGET_TYPE.ANSWER]: { exists: reportRepository.existsAnswer, notFound: ErrorCode.ANSWER_NOT_FOUND },
});

// 질문·답변 신고 (REQ-QUESTION-011, REQ-ANSWER-008). 신고 처리는 관리자 API(#51)에서 한다.
async function createReport(reporterId, { targetType, targetId, reason, reasonDetail }) {
  // 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
  await findWritableMember(reporterId);

  const { exists, notFound } = TARGET_CHECKS[targetType];
  if (!(await exists(targetId))) {
    throw new AppError(notFound);
  }

  try {
    return await reportRepository.insertReport({ reporterId, targetType, targetId, reason, reasonDetail });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(ErrorCode.ALREADY_REPORTED);
    }
    throw err;
  }
}

module.exports = { createReport };
