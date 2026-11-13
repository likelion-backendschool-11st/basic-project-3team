const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { fail } = require('../utils/response');

// Express는 인자가 4개인 함수만 에러 핸들러로 인식하므로 next를 지우지 않는다.
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return fail(res, err.errorCode, err.data);
  }
  // express.json()이 잘못된 JSON 본문을 받은 경우
  if (err.type === 'entity.parse.failed') {
    return fail(res, ErrorCode.INVALID_INPUT);
  }
  console.error(err);
  return fail(res, ErrorCode.INTERNAL_SERVER_ERROR);
}

module.exports = errorHandler;
