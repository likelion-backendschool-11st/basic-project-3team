const boardService = require('./board.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePathId } = require('../utils/params');
const { TITLE_MIN, TITLE_MAX, CONTENT_MIN, CONTENT_MAX, MAX_TAGS } = require('./board.constants');

// [...str].length: 이모지 등도 1자로 센다 (MySQL VARCHAR 글자 수와 같게)
const charLength = (str) => [...str].length;

// 필드별 검사. 통과하면 { value }, 실패하면 { reason }을 돌려준다.
function parseTitle(title) {
  const trimmed = typeof title === 'string' ? title.trim() : '';
  if (charLength(trimmed) < TITLE_MIN) {
    return { reason: `제목은 ${TITLE_MIN}자 이상 입력해주세요.` };
  }
  if (charLength(trimmed) > TITLE_MAX) {
    return { reason: `제목은 ${TITLE_MAX}자 이하로 입력해주세요.` };
  }
  return { value: trimmed };
}

// 본문은 마크다운이라 공백을 보존해 저장하고, 길이 하한만 공백 제외로 검사한다.
function parseContent(content) {
  if (typeof content !== 'string' || charLength(content.trim()) < CONTENT_MIN) {
    return { reason: `내용은 ${CONTENT_MIN}자 이상 입력해주세요.` };
  }
  if (charLength(content) > CONTENT_MAX) {
    return { reason: `내용은 ${CONTENT_MAX.toLocaleString()}자 이하로 입력해주세요.` };
  }
  return { value: content };
}

function parseCategoryId(categoryId) {
  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return { reason: '카테고리를 1개 선택해주세요.' };
  }
  return { value: categoryId };
}

function parseTags(tags) {
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
    return { reason: '태그는 문자열 목록이어야 합니다.' };
  }
  const tagNames = [...new Set(tags.map((tag) => tag.trim().toLowerCase()))];
  if (tagNames.length > MAX_TAGS) {
    return { reason: `태그는 최대 ${MAX_TAGS}개까지 선택할 수 있습니다.` };
  }
  return { value: tagNames };
}

// 요청 필드 → [결과 키, 검사 함수]
const QUESTION_FIELDS = Object.freeze({
  title: ['title', parseTitle],
  content: ['content', parseContent],
  categoryId: ['categoryId', parseCategoryId],
  tags: ['tagNames', parseTags],
});

// 작성(partial = false): 모든 필드를 검사하고 tags는 없으면 빈 목록.
// 수정(partial = true): 보낸 필드만 검사하고, 보내지 않은 필드는 결과에 넣지 않는다.
function parseQuestionBody(body, partial) {
  const input = body ?? {};
  const errors = [];
  const result = {};

  for (const [field, [key, parse]] of Object.entries(QUESTION_FIELDS)) {
    if (partial && !Object.hasOwn(input, field)) {
      continue;
    }
    const value = !partial && field === 'tags' ? (input.tags ?? []) : input[field];
    const parsed = parse(value);
    if (parsed.reason) {
      errors.push({ field, reason: parsed.reason });
    } else {
      result[key] = parsed.value;
    }
  }

  if (partial && errors.length === 0 && Object.keys(result).length === 0) {
    errors.push({ field: 'body', reason: '수정할 항목을 1개 이상 보내주세요.' });
  }
  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
  return result;
}

async function createQuestion(req, res, next) {
  try {
    const questionId = await boardService.createQuestion(req.user.memberId, parseQuestionBody(req.body, false));
    return success(res, { questionId }, 201);
  } catch (err) {
    return next(err);
  }
}

const parseQuestionId = (value) => parsePathId(value, 'questionId');

async function getQuestion(req, res, next) {
  try {
    const data = await boardService.getQuestion(parseQuestionId(req.params.questionId));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const questionId = parseQuestionId(req.params.questionId);
    await boardService.updateQuestion(req.user.memberId, questionId, parseQuestionBody(req.body, true));
    return success(res, { questionId });
  } catch (err) {
    return next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    await boardService.deleteQuestion(req.user, parseQuestionId(req.params.questionId));
    return success(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createQuestion, getQuestion, updateQuestion, deleteQuestion };
