const memberService = require('./member.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { LOGIN_ID_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN, NICKNAME_PATTERN } = require('./member.constants');

const FIELD_RULES = Object.freeze({
  loginId: {
    pattern: LOGIN_ID_PATTERN,
    reason: '아이디는 8~12자의 영문, 숫자, 특수기호(_ . -)만 사용할 수 있습니다.',
  },
  password: {
    pattern: PASSWORD_PATTERN,
    reason: '비밀번호는 8~12자의 영문, 숫자, 특수기호(_ . -)만 사용할 수 있습니다.',
  },
  nickname: {
    pattern: NICKNAME_PATTERN,
    reason: '닉네임은 2~10자의 한글, 영문, 숫자만 사용할 수 있습니다.',
  },
  phone: {
    pattern: PHONE_PATTERN,
    reason: '전화번호는 01로 시작하는 하이픈 없는 숫자 10~11자리여야 합니다.',
  },
});

function fieldError(field, value) {
  const { pattern, reason } = FIELD_RULES[field];
  return typeof value === 'string' && pattern.test(value) ? null : { field, reason };
}

// 검사한 필드만 담아 반환한다. 하나라도 틀리면 필드별 에러 목록으로 400.
function validateFields(source, fields) {
  const errors = fields.map((field) => fieldError(field, source[field])).filter(Boolean);
  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return Object.fromEntries(fields.map((field) => [field, source[field]]));
}

async function signup(req, res, next) {
  try {
    const input = validateFields(req.body ?? {}, ['loginId', 'password', 'nickname', 'phone']);
    const data = await memberService.signup(input);
    return success(res, data, 201);
  } catch (err) {
    return next(err);
  }
}

async function checkLoginId(req, res, next) {
  try {
    const { loginId } = validateFields(req.query, ['loginId']);
    return success(res, await memberService.checkLoginId(loginId));
  } catch (err) {
    return next(err);
  }
}

async function checkPhone(req, res, next) {
  try {
    const { phone } = validateFields(req.query, ['phone']);
    return success(res, await memberService.checkPhone(phone));
  } catch (err) {
    return next(err);
  }
}

async function checkNickname(req, res, next) {
  try {
    const { nickname } = validateFields(req.query, ['nickname']);
    return success(res, await memberService.checkNickname(nickname));
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, checkLoginId, checkPhone, checkNickname };
