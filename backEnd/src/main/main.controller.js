const mainService = require('./main.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../utils/constants');
const { QUESTION_SORT } = require('./main.constants');

const SORT_VALUES = Object.values(QUESTION_SORT);
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

function parseListQuery(query) {
  const errors = [];

  const page = parseIntParam(query.page, DEFAULT_PAGE, 0, Number.MAX_SAFE_INTEGER);
  if (page === null) {
    errors.push({ field: 'page', reason: 'page는 0 이상의 정수여야 합니다.' });
  }

  const size = parseIntParam(query.size, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  if (size === null) {
    errors.push({ field: 'size', reason: `size는 1~${MAX_PAGE_SIZE} 사이의 정수여야 합니다.` });
  }

  const sort = query.sort === undefined || query.sort === '' ? QUESTION_SORT.LATEST : query.sort;
  if (!SORT_VALUES.includes(sort)) {
    errors.push({ field: 'sort', reason: `sort는 ${SORT_VALUES.join(', ')} 중 하나여야 합니다.` });
  }

  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { page, size, sort };
}

async function getQuestions(req, res, next) {
  try {
    const data = await mainService.getQuestions(parseListQuery(req.query));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getQuestions };
