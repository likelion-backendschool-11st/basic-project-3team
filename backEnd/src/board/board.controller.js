const boardService = require('./board.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { TITLE_MIN, TITLE_MAX, CONTENT_MIN, CONTENT_MAX, MAX_TAGS } = require('./board.constants');

// [...str].length: 이모지 등도 1자로 센다 (MySQL VARCHAR 글자 수와 같게)
const charLength = (str) => [...str].length;

function parseCreateBody(body) {
  const { title, content, categoryId, tags = [] } = body ?? {};
  const errors = [];

  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  if (charLength(trimmedTitle) < TITLE_MIN) {
    errors.push({ field: 'title', reason: `제목은 ${TITLE_MIN}자 이상 입력해주세요.` });
  } else if (charLength(trimmedTitle) > TITLE_MAX) {
    errors.push({ field: 'title', reason: `제목은 ${TITLE_MAX}자 이하로 입력해주세요.` });
  }

  // 본문은 마크다운이라 공백을 보존해 저장하고, 길이 하한만 공백 제외로 검사한다.
  if (typeof content !== 'string' || charLength(content.trim()) < CONTENT_MIN) {
    errors.push({ field: 'content', reason: `내용은 ${CONTENT_MIN}자 이상 입력해주세요.` });
  } else if (charLength(content) > CONTENT_MAX) {
    errors.push({ field: 'content', reason: `내용은 ${CONTENT_MAX.toLocaleString()}자 이하로 입력해주세요.` });
  }

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    errors.push({ field: 'categoryId', reason: '카테고리를 1개 선택해주세요.' });
  }

  let tagNames = [];
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
    errors.push({ field: 'tags', reason: '태그는 문자열 목록이어야 합니다.' });
  } else {
    tagNames = [...new Set(tags.map((tag) => tag.trim().toLowerCase()))];
    if (tagNames.length > MAX_TAGS) {
      errors.push({ field: 'tags', reason: `태그는 최대 ${MAX_TAGS}개까지 선택할 수 있습니다.` });
    }
  }

  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return { title: trimmedTitle, content, categoryId, tagNames };
}

async function createQuestion(req, res, next) {
  try {
    const questionId = await boardService.createQuestion(req.user.memberId, parseCreateBody(req.body));
    return success(res, { questionId }, 201);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createQuestion };
