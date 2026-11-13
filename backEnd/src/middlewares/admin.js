const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { ROLE } = require('../utils/constants');

// docs/auth.md: /api/admin/** 전체에 auth 다음에 적용하고, ROLE_ADMIN이 아니면 403.
function admin(req, res, next) {
  if (!req.user) {
    return next(new AppError(ErrorCode.UNAUTHORIZED));
  }
  if (req.user.role !== ROLE.ADMIN) {
    return next(new AppError(ErrorCode.FORBIDDEN));
  }
  return next();
}

module.exports = admin;
