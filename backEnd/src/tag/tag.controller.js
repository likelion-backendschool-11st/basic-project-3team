const tagService = require('./tag.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const {
  TAG_KEYWORD_MAX,
  RECOMMEND_TITLE_MAX,
  RECOMMEND_CONTENT_MAX,
  POPULAR_DEFAULT_LIMIT,
  POPULAR_MAX_LIMIT,
} = require('./tag.constants');

const DIGITS = /^\d+$/;

function invalid(field, reason) {
  return new AppError(ErrorCode.INVALID_INPUT, { errors: [{ field, reason }] });
}

// ?keyword= 선택. 앞뒤 공백을 지우고, 비어 있으면 전체 목록.
function parseKeyword(value) {
  if (value === undefined) return null;
  if (typeof value !== 'string') throw invalid('keyword', 'keyword는 하나만 보낼 수 있습니다.');
  const keyword = value.trim();
  if (keyword.length > TAG_KEYWORD_MAX) throw invalid('keyword', `keyword는 ${TAG_KEYWORD_MAX}자 이하여야 합니다.`);
  return keyword || null;
}

function parseLimit(value) {
  if (value === undefined || value === '') return POPULAR_DEFAULT_LIMIT;
  const limit = typeof value === 'string' && DIGITS.test(value) ? Number(value) : NaN;
  if (!(limit >= 1 && limit <= POPULAR_MAX_LIMIT)) {
    throw invalid('limit', `limit은 1~${POPULAR_MAX_LIMIT} 사이의 정수여야 합니다.`);
  }
  return limit;
}

// 제목·내용은 작성 중인 값이라 비어 있어도 된다. 문자열이 아니거나 너무 길면 400.
function parseRecommendBody(body) {
  const errors = [];
  const read = (field, max) => {
    const value = body?.[field] ?? '';
    if (typeof value !== 'string') {
      errors.push({ field, reason: `${field}는 문자열이어야 합니다.` });
      return '';
    }
    if (value.length > max) {
      errors.push({ field, reason: `${field}는 ${max}자 이하여야 합니다.` });
    }
    return value;
  };
  const title = read('title', RECOMMEND_TITLE_MAX);
  const content = read('content', RECOMMEND_CONTENT_MAX);
  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { title, content };
}

async function getTags(req, res, next) {
  try {
    return success(res, await tagService.getTags(parseKeyword(req.query.keyword)));
  } catch (err) {
    return next(err);
  }
}

async function getPopularTags(req, res, next) {
  try {
    return success(res, await tagService.getPopularTags(parseLimit(req.query.limit)));
  } catch (err) {
    return next(err);
  }
}

async function recommendTags(req, res, next) {
  try {
    return success(res, await tagService.recommendTags(parseRecommendBody(req.body)));
  } catch (err) {
    return next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    return success(res, await tagService.getCategories());
  } catch (err) {
    return next(err);
  }
}

module.exports = { getTags, getPopularTags, recommendTags, getCategories };
