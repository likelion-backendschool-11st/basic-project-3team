const reportService = require('./report.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { REPORT_TARGET_TYPE, REPORT_REASON, REASON_DETAIL_MAX } = require('./report.constants');

const TARGET_TYPES = Object.values(REPORT_TARGET_TYPE);
const REASONS = Object.values(REPORT_REASON);

// [...str].length: 이모지 등도 1자로 센다 (MySQL VARCHAR 글자 수와 같게)
const charLength = (str) => [...str].length;

function parseCreateBody(body) {
  const { targetType, targetId, reason, reasonDetail } = body ?? {};
  const errors = [];

  if (!TARGET_TYPES.includes(targetType)) {
    errors.push({ field: 'targetType', reason: `targetType은 ${TARGET_TYPES.join(', ')} 중 하나여야 합니다.` });
  }
  if (!Number.isSafeInteger(targetId) || targetId < 1) {
    errors.push({ field: 'targetId', reason: 'targetId는 1 이상의 정수여야 합니다.' });
  }
  if (!REASONS.includes(reason)) {
    errors.push({ field: 'reason', reason: '신고 사유를 선택해주세요.' });
  }

  // 직접 입력 사유는 ETC일 때만 받고, 다른 사유와 함께 보낸 값은 저장하지 않는다.
  let detail = null;
  if (reason === REPORT_REASON.ETC) {
    detail = typeof reasonDetail === 'string' ? reasonDetail.trim() : '';
    if (detail === '') {
      errors.push({ field: 'reasonDetail', reason: '기타 사유를 입력해주세요.' });
    } else if (charLength(detail) > REASON_DETAIL_MAX) {
      errors.push({ field: 'reasonDetail', reason: `기타 사유는 ${REASON_DETAIL_MAX}자 이하로 입력해주세요.` });
    }
  }

  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { targetType, targetId, reason, reasonDetail: detail };
}

async function createReport(req, res, next) {
  try {
    const reportId = await reportService.createReport(req.user.memberId, parseCreateBody(req.body));
    return success(res, { reportId }, 201);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createReport };
