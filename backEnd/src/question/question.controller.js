const questionService = require('./question.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePageQuery } = require('../utils/page');
const { QUESTION_SORT, SEARCH_SCOPE, KEYWORD_MAX_LENGTH, MAX_SEARCH_TAGS } = require('./question.constants');

const SORT_VALUES = Object.values(QUESTION_SORT);
const SCOPE_VALUES = Object.values(SEARCH_SCOPE);
const POSITIVE_INT = /^[1-9]\d*$/;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

// 같은 이름의 파라미터를 여러 번 보내면 Express가 배열로 넘긴다. tags 외에는 문자열이 아니면 형식 오류로 본다.
function isAbsent(value) {
  return value === undefined || value === '';
}

function isValidDate(value) {
  if (!DATE_FORMAT.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseKeyword(value, errors) {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    errors.push({ field: 'keyword', reason: '검색어 형식이 올바르지 않습니다.' });
    return null;
  }
  const keyword = value.trim();
  if (keyword.length > KEYWORD_MAX_LENGTH) {
    errors.push({ field: 'keyword', reason: `검색어는 ${KEYWORD_MAX_LENGTH}자 이하로 입력해주세요.` });
    return null;
  }
  return keyword === '' ? null : keyword;
}

function parseEnum(field, value, allowed, defaultValue, errors) {
  if (isAbsent(value)) {
    return defaultValue;
  }
  if (!allowed.includes(value)) {
    errors.push({ field, reason: `${field}는 ${allowed.join(', ')} 중 하나여야 합니다.` });
    return defaultValue;
  }
  return value;
}

function parseCategoryId(value, errors) {
  if (isAbsent(value)) {
    return null;
  }
  if (typeof value !== 'string' || !POSITIVE_INT.test(value) || !Number.isSafeInteger(Number(value))) {
    errors.push({ field: 'categoryId', reason: 'categoryId는 1 이상의 정수여야 합니다.' });
    return null;
  }
  return Number(value);
}

// tags=spring,jpa 또는 tags=spring&tags=jpa 둘 다 받는다. 소문자로 바꾸고 중복을 지운다.
function parseTags(value, errors) {
  if (isAbsent(value)) {
    return [];
  }
  const names = [value]
    .flat()
    .filter((item) => typeof item === 'string')
    .flatMap((item) => item.split(','))
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name !== '');
  const tags = [...new Set(names)];
  if (tags.length > MAX_SEARCH_TAGS) {
    errors.push({ field: 'tags', reason: `태그는 최대 ${MAX_SEARCH_TAGS}개까지 선택할 수 있습니다.` });
    return [];
  }
  return tags;
}

function parseDate(field, value, errors) {
  if (isAbsent(value)) {
    return null;
  }
  if (typeof value !== 'string' || !isValidDate(value)) {
    errors.push({ field, reason: `${field}는 YYYY-MM-DD 형식의 날짜여야 합니다.` });
    return null;
  }
  return value;
}

function parseAccepted(value, errors) {
  const accepted = parseEnum('accepted', value, ['true', 'false'], null, errors);
  return accepted === null ? null : accepted === 'true';
}

function parseSearchQuery(query) {
  const { page, size, errors } = parsePageQuery(query);

  const sort = parseEnum('sort', query.sort, SORT_VALUES, QUESTION_SORT.LATEST, errors);
  const keyword = parseKeyword(query.keyword, errors);
  const scope = parseEnum('scope', query.scope, SCOPE_VALUES, SEARCH_SCOPE.ALL, errors);
  const categoryId = parseCategoryId(query.categoryId, errors);
  const tags = parseTags(query.tags, errors);
  const startDate = parseDate('startDate', query.startDate, errors);
  const endDate = parseDate('endDate', query.endDate, errors);
  const accepted = parseAccepted(query.accepted, errors);

  // YYYY-MM-DD 문자열은 사전순 비교가 날짜 비교와 같다.
  if (startDate !== null && endDate !== null && startDate > endDate) {
    errors.push({ field: 'startDate', reason: '시작일은 종료일보다 늦을 수 없습니다.' });
  }

  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { page, size, sort, keyword, scope, categoryId, tags, startDate, endDate, accepted };
}

async function searchQuestions(req, res, next) {
  try {
    const data = await questionService.searchQuestions(parseSearchQuery(req.query));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { searchQuestions };
