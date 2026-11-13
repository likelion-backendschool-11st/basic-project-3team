const adminMemberService = require('./adminMember.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePageQuery } = require('../utils/page');
const { MEMBER_STATUS } = require('../utils/constants');
const { MEMBER_KEYWORD_MAX, CHANGEABLE_MEMBER_STATUS } = require('./admin.constants');

const STATUSES = Object.values(MEMBER_STATUS);
const POSITIVE_INT = /^[1-9]\d*$/;

function parseMemberListQuery(query) {
  const { page, size, errors } = parsePageQuery(query);

  let status = null;
  if (query.status !== undefined && query.status !== '') {
    if (STATUSES.includes(query.status)) {
      status = query.status;
    } else {
      errors.push({ field: 'status', reason: `status는 ${STATUSES.join(', ')} 중 하나여야 합니다.` });
    }
  }

  let keyword = null;
  if (query.keyword !== undefined) {
    if (typeof query.keyword !== 'string') {
      errors.push({ field: 'keyword', reason: 'keyword는 하나만 보낼 수 있습니다.' });
    } else if (query.keyword.trim().length > MEMBER_KEYWORD_MAX) {
      errors.push({ field: 'keyword', reason: `keyword는 ${MEMBER_KEYWORD_MAX}자 이하여야 합니다.` });
    } else {
      keyword = query.keyword.trim() || null;
    }
  }

  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { page, size, status, keyword };
}

function parseMemberId(value) {
  if (!POSITIVE_INT.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'memberId', reason: 'memberId는 1 이상의 정수여야 합니다.' }],
    });
  }
  return Number(value);
}

function parseStatusBody(body) {
  const status = body?.status;
  if (!CHANGEABLE_MEMBER_STATUS.includes(status)) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'status', reason: `status는 ${CHANGEABLE_MEMBER_STATUS.join(', ')} 중 하나여야 합니다.` }],
    });
  }
  return status;
}

async function getMembers(req, res, next) {
  try {
    const data = await adminMemberService.getMembers(parseMemberListQuery(req.query));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function changeMemberStatus(req, res, next) {
  try {
    const memberId = parseMemberId(req.params.memberId);
    const status = parseStatusBody(req.body);
    const data = await adminMemberService.changeMemberStatus(req.user.memberId, memberId, status);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMembers, changeMemberStatus };
