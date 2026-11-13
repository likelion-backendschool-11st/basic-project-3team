const adminService = require('./admin.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePageQuery } = require('../utils/page');
const { REPORT_TARGET_TYPE } = require('../report/report.constants');
const { REPORT_STATUS, REPORT_ACTION, REPORT_SORT } = require('./admin.constants');

const TARGET_TYPES = Object.values(REPORT_TARGET_TYPE);
const STATUSES = Object.values(REPORT_STATUS);
const ACTIONS = Object.values(REPORT_ACTION);
const SORTS = Object.values(REPORT_SORT);
const POSITIVE_INT = /^[1-9]\d*$/;

// 값이 없으면 defaultValue, 허용 목록에 없으면 errors에 담는다.
function parseEnum(field, value, allowed, defaultValue, errors) {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  if (!allowed.includes(value)) {
    errors.push({ field, reason: `${field}는 ${allowed.join(', ')} 중 하나여야 합니다.` });
    return defaultValue;
  }
  return value;
}

function parseReportId(value) {
  if (!POSITIVE_INT.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'reportId', reason: 'reportId는 1 이상의 정수여야 합니다.' }],
    });
  }
  return Number(value);
}

function parseReportListQuery(query) {
  const { page, size, errors } = parsePageQuery(query);
  const targetType = parseEnum('targetType', query.targetType, TARGET_TYPES, null, errors);
  const status = parseEnum('status', query.status, STATUSES, null, errors);
  const sort = parseEnum('sort', query.sort, SORTS, REPORT_SORT.LATEST, errors);

  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { page, size, sort, targetType, status };
}

function parseAction(body) {
  const action = body?.action;
  if (!ACTIONS.includes(action)) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'action', reason: `action은 ${ACTIONS.join(', ')} 중 하나여야 합니다.` }],
    });
  }
  return action;
}

async function getReports(req, res, next) {
  try {
    const data = await adminService.getReports(parseReportListQuery(req.query));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const data = await adminService.getReport(parseReportId(req.params.reportId));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function processReport(req, res, next) {
  try {
    const reportId = parseReportId(req.params.reportId);
    const action = parseAction(req.body);
    const data = await adminService.processReport(req.user.memberId, reportId, action);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getReports, getReport, processReport };
