const authService = require('./auth.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { REFRESH_TOKEN_EXPIRES_IN_MS, REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } = require('./auth.constants');
const { LOGIN_ID_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN, NICKNAME_PATTERN } = require('../member/member.constants');

// 아이디·비밀번호 찾기 입력값 규칙 (회원가입과 같은 규칙, docs/api.md 1장)
const FIND_ACCOUNT_RULES = Object.freeze({
  loginId: {
    pattern: LOGIN_ID_PATTERN,
    reason: '아이디는 8~12자의 영문, 숫자, 특수기호(_ . -)만 사용할 수 있습니다.',
  },
  newPassword: {
    pattern: PASSWORD_PATTERN,
    reason: '비밀번호는 8~12자의 영문, 숫자, 특수기호(_ . -)만 사용할 수 있습니다.',
  },
  nickname: { pattern: NICKNAME_PATTERN, reason: '닉네임은 2~10자의 한글, 영문, 숫자만 사용할 수 있습니다.' },
  phone: { pattern: PHONE_PATTERN, reason: '전화번호는 01로 시작하는 하이픈 없는 숫자 10~11자리여야 합니다.' },
});

// 검사한 필드만 담아 반환한다. 하나라도 틀리면 필드별 에러 목록으로 400.
function validateFindAccount(body, fields) {
  const errors = fields
    .filter((field) => typeof body[field] !== 'string' || !FIND_ACCOUNT_RULES[field].pattern.test(body[field]))
    .map((field) => ({ field, reason: FIND_ACCOUNT_RULES[field].reason }));
  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return Object.fromEntries(fields.map((field) => [field, body[field]]));
}

// docs/auth.md: HttpOnly, Secure(배포 환경), SameSite=Strict, 경로 /api/auth
const REFRESH_COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: REFRESH_COOKIE_PATH,
});

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_EXPIRES_IN_MS });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
}

// 형식 규칙은 검사하지 않는다. 틀린 형식도 LOGIN_FAILED로 응답해 가입 규칙을 드러내지 않는다.
function validateLogin(body) {
  const errors = ['loginId', 'password']
    .filter((field) => typeof body[field] !== 'string' || body[field].length === 0)
    .map((field) => ({ field, reason: `${field === 'loginId' ? '아이디' : '비밀번호'}를 입력해주세요.` }));
  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { loginId: body.loginId, password: body.password };
}

async function login(req, res, next) {
  try {
    const { body, refreshToken } = await authService.login(validateLogin(req.body ?? {}));
    setRefreshCookie(res, refreshToken);
    return success(res, body);
  } catch (err) {
    return next(err);
  }
}

async function reissue(req, res, next) {
  try {
    const { body, refreshToken } = await authService.reissue(req.cookies?.[REFRESH_COOKIE_NAME]);
    setRefreshCookie(res, refreshToken);
    return success(res, body);
  } catch (err) {
    // 재발급에 실패한 쿠키는 다시 쓸 수 없으므로 지운다.
    if (err instanceof AppError) {
      clearRefreshCookie(res);
    }
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.memberId);
    clearRefreshCookie(res);
    return success(res);
  } catch (err) {
    return next(err);
  }
}

async function findLoginId(req, res, next) {
  try {
    const input = validateFindAccount(req.body ?? {}, ['nickname', 'phone']);
    return success(res, await authService.findLoginId(input));
  } catch (err) {
    return next(err);
  }
}

async function verifyPasswordReset(req, res, next) {
  try {
    const input = validateFindAccount(req.body ?? {}, ['loginId', 'phone']);
    return success(res, await authService.verifyPasswordReset(input));
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const input = validateFindAccount(req.body ?? {}, ['loginId', 'phone', 'newPassword']);
    await authService.resetPassword(input);
    // 이 브라우저의 Refresh 쿠키도 더 이상 쓸 수 없으므로 지운다.
    clearRefreshCookie(res);
    return success(res);
  } catch (err) {
    return next(err);
  }
}

// setRefreshCookie는 마이페이지 비밀번호 변경에서 새 Refresh 쿠키를 내려줄 때 함께 쓴다 (쿠키 옵션을 한 곳에서 관리).
module.exports = { login, reissue, logout, findLoginId, verifyPasswordReset, resetPassword, setRefreshCookie };
