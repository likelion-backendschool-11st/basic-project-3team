// docs/api.md 1장 공통 응답 형식: { success, code, message, data }

function success(res, data = null, status = 200) {
  return res.status(status).json({ success: true, code: null, message: null, data });
}

function fail(res, errorCode, data = null) {
  return res.status(errorCode.status).json({
    success: false,
    code: errorCode.code,
    message: errorCode.message,
    data,
  });
}

module.exports = { success, fail };
