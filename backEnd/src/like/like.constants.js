const ErrorCode = require('../utils/errorCode');

// 좋아요 대상 (docs/api.md 7장). SQL에 넣는 테이블·컬럼 이름은 이 허용 목록에서만 가져온다 (docs/convention.md).
const LIKE_TARGETS = Object.freeze({
  QUESTION: Object.freeze({
    table: 'question',
    idColumn: 'question_id',
    likeTable: 'question_like',
    param: 'questionId',
    notFound: ErrorCode.QUESTION_NOT_FOUND,
  }),
  ANSWER: Object.freeze({
    table: 'answer',
    idColumn: 'answer_id',
    likeTable: 'answer_like',
    param: 'answerId',
    notFound: ErrorCode.ANSWER_NOT_FOUND,
  }),
});

module.exports = { LIKE_TARGETS };
