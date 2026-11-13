// 태그·카테고리 (docs/api.md 10장)

// 태그 목록 검색어 최대 길이 (tag.name VARCHAR(30))
const TAG_KEYWORD_MAX = 30;

// 추천 태그: 질문 입력값 길이 제한은 질문 작성 규칙(docs/api.md 1장)과 같다.
const RECOMMEND_TITLE_MAX = 100;
const RECOMMEND_CONTENT_MAX = 10000;
// 질문 하나에 달 수 있는 태그 수와 같다.
const RECOMMEND_MAX = 8;

// 인기 태그 개수 (?limit=)
const POPULAR_DEFAULT_LIMIT = 10;
const POPULAR_MAX_LIMIT = 20;

module.exports = {
  TAG_KEYWORD_MAX,
  RECOMMEND_TITLE_MAX,
  RECOMMEND_CONTENT_MAX,
  RECOMMEND_MAX,
  POPULAR_DEFAULT_LIMIT,
  POPULAR_MAX_LIMIT,
};
