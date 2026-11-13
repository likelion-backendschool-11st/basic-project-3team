const auth = require('./auth');

// 로그인하지 않아도 쓰는 조회 API용 (질문 상세, 답변 목록).
// 토큰이 없으면 비로그인으로 통과하고(req.user 없음), 있으면 auth와 똑같이 검사해 req.user = { memberId, role }을 넣는다.
// 만료된 토큰은 auth처럼 401 TOKEN_EXPIRED를 돌려줘, 프론트가 재발급 후 다시 요청해 liked 등을 정확히 받게 한다.
function optionalAuth(req, res, next) {
  if (!req.headers.authorization) {
    return next();
  }
  return auth(req, res, next);
}

module.exports = optionalAuth;
