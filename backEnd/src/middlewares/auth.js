const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');

// docs/auth.md: Authorization 헤더의 Access Token을 검증하고 req.user = { memberId, role }을 넣는다.
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return next(new AppError(ErrorCode.UNAUTHORIZED));
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(ErrorCode.INVALID_TOKEN));
  }
  try {
    const { memberId, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { memberId, role };
    return next();
  } catch (err) {
    const errorCode = err.name === 'TokenExpiredError' ? ErrorCode.TOKEN_EXPIRED : ErrorCode.INVALID_TOKEN;
    return next(new AppError(errorCode));
  }
}

module.exports = auth;
