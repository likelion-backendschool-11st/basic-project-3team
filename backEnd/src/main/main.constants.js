// 메인 질문 목록 정렬 (docs/api.md 4장). 값이 바뀌면 main.repository.js의 ORDER_BY도 함께 고친다.
const QUESTION_SORT = Object.freeze({
  LATEST: 'latest',
  VIEWS: 'views',
  ANSWERS: 'answers',
  LIKES: 'likes',
});

module.exports = { QUESTION_SORT };
