// docs/api.md 1장 입력값 규칙 (질문)
const TITLE_MIN = 5;
const TITLE_MAX = 100;
const CONTENT_MIN = 10;
const CONTENT_MAX = 10000;
const MAX_TAGS = 8;

// 유사 질문 (docs/api.md 4장, REQ-QUESTION-009)
const SIMILAR_LIMIT = 3; // 최대 개수
const SIMILAR_WORD_MIN_LENGTH = 2; // 제목 단어로 쓸 최소 글자 수
const SIMILAR_WORD_COUNT = 3; // 제목 앞에서부터 쓸 단어 수

module.exports = {
  TITLE_MIN,
  TITLE_MAX,
  CONTENT_MIN,
  CONTENT_MAX,
  MAX_TAGS,
  SIMILAR_LIMIT,
  SIMILAR_WORD_MIN_LENGTH,
  SIMILAR_WORD_COUNT,
};
