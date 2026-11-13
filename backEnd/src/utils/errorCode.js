// docs/api.md 1장 에러 코드 표와 같은 값을 유지한다.
const ErrorCode = Object.freeze({
  INVALID_INPUT: { status: 400, code: 'INVALID_INPUT', message: '입력값이 올바르지 않습니다.' },
  PASSWORD_MISMATCH: { status: 400, code: 'PASSWORD_MISMATCH', message: '현재 비밀번호가 일치하지 않습니다.' },
  CANNOT_ACCEPT_OWN_ANSWER: {
    status: 400,
    code: 'CANNOT_ACCEPT_OWN_ANSWER',
    message: '본인 답변은 채택할 수 없습니다.',
  },
  CANNOT_LIKE_OWN_POST: {
    status: 400,
    code: 'CANNOT_LIKE_OWN_POST',
    message: '본인 질문·답변에는 좋아요를 누를 수 없습니다.',
  },

  UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
  TOKEN_EXPIRED: { status: 401, code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' },
  INVALID_TOKEN: { status: 401, code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' },
  INVALID_REFRESH_TOKEN: {
    status: 401,
    code: 'INVALID_REFRESH_TOKEN',
    message: '다시 로그인해주세요.',
  },
  LOGIN_FAILED: { status: 401, code: 'LOGIN_FAILED', message: '아이디 또는 비밀번호가 일치하지 않습니다.' },

  FORBIDDEN: { status: 403, code: 'FORBIDDEN', message: '권한이 없습니다.' },
  MEMBER_BANNED: { status: 403, code: 'MEMBER_BANNED', message: '정지된 회원입니다.' },
  MEMBER_WITHDRAWN: { status: 403, code: 'MEMBER_WITHDRAWN', message: '탈퇴한 회원입니다.' },

  API_NOT_FOUND: { status: 404, code: 'API_NOT_FOUND', message: '존재하지 않는 API입니다.' },
  MEMBER_NOT_FOUND: { status: 404, code: 'MEMBER_NOT_FOUND', message: '존재하지 않는 회원입니다.' },
  QUESTION_NOT_FOUND: { status: 404, code: 'QUESTION_NOT_FOUND', message: '존재하지 않는 질문입니다.' },
  ANSWER_NOT_FOUND: { status: 404, code: 'ANSWER_NOT_FOUND', message: '존재하지 않는 답변입니다.' },
  REPLY_NOT_FOUND: { status: 404, code: 'REPLY_NOT_FOUND', message: '존재하지 않는 답글입니다.' },
  LIKE_NOT_FOUND: { status: 404, code: 'LIKE_NOT_FOUND', message: '좋아요하지 않은 대상입니다.' },
  REPORT_NOT_FOUND: { status: 404, code: 'REPORT_NOT_FOUND', message: '존재하지 않는 신고입니다.' },
  CATEGORY_NOT_FOUND: { status: 404, code: 'CATEGORY_NOT_FOUND', message: '존재하지 않는 카테고리입니다.' },
  NOTIFICATION_NOT_FOUND: {
    status: 404,
    code: 'NOTIFICATION_NOT_FOUND',
    message: '존재하지 않는 알림입니다.',
  },

  DUPLICATE_LOGIN_ID: { status: 409, code: 'DUPLICATE_LOGIN_ID', message: '이미 사용 중인 아이디입니다.' },
  DUPLICATE_PHONE: { status: 409, code: 'DUPLICATE_PHONE', message: '이미 가입된 전화번호입니다.' },
  DUPLICATE_NICKNAME: { status: 409, code: 'DUPLICATE_NICKNAME', message: '이미 사용 중인 닉네임입니다.' },
  ALREADY_LIKED: { status: 409, code: 'ALREADY_LIKED', message: '이미 좋아요를 눌렀습니다.' },
  ALREADY_REPORTED: { status: 409, code: 'ALREADY_REPORTED', message: '이미 신고한 대상입니다.' },
  ALREADY_ACCEPTED: { status: 409, code: 'ALREADY_ACCEPTED', message: '이미 채택된 답변이 있습니다.' },
  QUESTION_HAS_ACCEPTED_ANSWER: {
    status: 409,
    code: 'QUESTION_HAS_ACCEPTED_ANSWER',
    message: '채택된 답변이 있는 질문은 삭제할 수 없습니다.',
  },
  ACCEPTED_ANSWER_LOCKED: {
    status: 409,
    code: 'ACCEPTED_ANSWER_LOCKED',
    message: '채택된 답변은 수정·삭제할 수 없습니다.',
  },

  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 오류가 발생했습니다.',
  },
});

module.exports = ErrorCode;
