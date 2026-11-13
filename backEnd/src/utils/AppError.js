class AppError extends Error {
  // errorCode: utils/errorCode.js의 값, data: 응답의 data (검증 실패 시 { errors: [...] })
  constructor(errorCode, data = null) {
    super(errorCode.message);
    this.name = 'AppError';
    this.errorCode = errorCode;
    this.data = data;
  }
}

module.exports = AppError;
