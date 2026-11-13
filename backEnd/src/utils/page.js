// 목록 API 공통 페이징 (docs/api.md 1장 페이징 응답, REQ-SEARCH-005)
// 사용법: Controller에서 parsePageQuery(req.query) → Repository에 LIMIT size OFFSET getOffset(page, size)
//        → COUNT(*) 결과와 함께 toPage(content, page, size, totalElements)로 응답한다.
const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('./constants');

const DIGITS = /^\d+$/;

// 값이 없으면 기본값, 0 이상 정수 문자열이 아니거나 범위를 벗어나면 null
function parseIntParam(value, defaultValue, min, max) {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  if (typeof value !== 'string' || !DIGITS.test(value)) {
    return null;
  }
  const number = Number(value);
  return number >= min && number <= max ? number : null;
}

// ?page=&size= 검사. 틀린 값은 errors에 담아 돌려주므로,
// Controller는 다른 파라미터 검사 결과와 합쳐 한 번에 400 INVALID_INPUT으로 응답한다.
function parsePageQuery(query) {
  const errors = [];

  const page = parseIntParam(query.page, DEFAULT_PAGE, 0, Number.MAX_SAFE_INTEGER);
  if (page === null) {
    errors.push({ field: 'page', reason: 'page는 0 이상의 정수여야 합니다.' });
  }

  const size = parseIntParam(query.size, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  if (size === null) {
    errors.push({ field: 'size', reason: `size는 1~${MAX_PAGE_SIZE} 사이의 정수여야 합니다.` });
  }

  return { page, size, errors };
}

function getOffset(page, size) {
  return page * size;
}

// docs/api.md 1장 페이징 응답 형식
function toPage(content, page, size, totalElements) {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
  };
}

module.exports = { parsePageQuery, getOffset, toPage };
