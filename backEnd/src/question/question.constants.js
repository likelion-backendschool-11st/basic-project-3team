// 질문 검색 (docs/api.md 4장 검색). 값이 바뀌면 question.repository.js의 ORDER_BY·SCOPE_CONDITIONS도 함께 고친다.
const QUESTION_SORT = Object.freeze({
  LATEST: 'latest',
  VIEWS: 'views',
  ANSWERS: 'answers',
  LIKES: 'likes',
});

// 검색어를 찾을 범위
const SEARCH_SCOPE = Object.freeze({
  ALL: 'all',
  TITLE: 'title',
  CONTENT: 'content',
  TAG: 'tag',
});

const KEYWORD_MAX_LENGTH = 100;
const MAX_SEARCH_TAGS = 8;

module.exports = { QUESTION_SORT, SEARCH_SCOPE, KEYWORD_MAX_LENGTH, MAX_SEARCH_TAGS };
