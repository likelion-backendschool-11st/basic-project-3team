const authService = require('./auth.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { REFRESH_TOKEN_EXPIRES_IN_MS, REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } = require('./auth.constants');

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

module.exports = { login, reissue, logout };
