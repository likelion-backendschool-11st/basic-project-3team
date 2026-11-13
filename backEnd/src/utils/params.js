const AppError = require('./AppError');
const ErrorCode = require('./errorCode');

const DIGITS = /^\d+$/;

// URL 경로의 id(:questionId 등)를 1 이상의 정수로 바꾼다. 아니면 400 INVALID_INPUT (field는 에러 응답에 쓸 이름)
function parsePathId(value, field) {
  const id = DIGITS.test(value) ? Number(value) : 0;
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field, reason: `${field}는 1 이상의 정수여야 합니다.` }],
    });
  }
  return id;
}

module.exports = { parsePathId };
