// docs/auth.md: Access Token 30분, Refresh Token 14일
const ACCESS_TOKEN_EXPIRES_IN = '30m';
const REFRESH_TOKEN_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000;

// Refresh Token은 /api/auth 요청에만 전송되도록 경로를 제한한다.
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';

// 아이디 찾기 결과에서 보여줄 앞 글자 수 (#37)
const LOGIN_ID_VISIBLE_LENGTH = 3;

module.exports = {
  LOGIN_ID_VISIBLE_LENGTH,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
};
