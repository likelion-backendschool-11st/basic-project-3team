const reportRepository = require('./report.repository');
const { findWritableMember } = require('../member/mypage.service');
const { REPORT_TARGET_TYPE } = require('./report.constants');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');

const TARGETS = Object.freeze({
  [REPORT_TARGET_TYPE.QUESTION]: {
    findWriterId: reportRepository.findQuestionWriterId,
    notFound: ErrorCode.QUESTION_NOT_FOUND,
  },
  [REPORT_TARGET_TYPE.ANSWER]: {
    findWriterId: reportRepository.findAnswerWriterId,
    notFound: ErrorCode.ANSWER_NOT_FOUND,
  },
});

// 질문·답변 신고 (REQ-QUESTION-011, REQ-ANSWER-008). 신고 처리는 관리자 API(#51)에서 한다.
async function createReport(reporterId, { targetType, targetId, reason, reasonDetail }) {
  // 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
  await findWritableMember(reporterId);

  const { findWriterId, notFound } = TARGETS[targetType];
  const writerId = await findWriterId(targetId);
  if (writerId === null) {
    throw new AppError(notFound);
  }
  // BIGINT 설정에 따라 문자열로 올 수 있어 숫자로 맞춰 비교한다.
  if (Number(writerId) === Number(reporterId)) {
    throw new AppError(ErrorCode.CANNOT_REPORT_OWN_POST);
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
