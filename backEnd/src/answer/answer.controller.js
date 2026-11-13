const answerService = require('./answer.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePathId } = require('../utils/params');
const { CONTENT_MIN, CONTENT_MAX } = require('./answer.constants');

// 서버와 DB 글자 수를 같게 이모지 등도 1자로 센다.
const charLength = (str) => [...str].length;

// 본문은 마크다운이라 공백을 보존해 저장하고, 길이 하한만 공백 제외로 검사한다.
function parseContent(body) {
  const content = body?.content;
  let reason = null;
  if (typeof content !== 'string' || charLength(content.trim()) < CONTENT_MIN) {
    reason = `내용은 ${CONTENT_MIN}자 이상 입력해주세요.`;
  } else if (charLength(content) > CONTENT_MAX) {
    reason = `내용은 ${CONTENT_MAX.toLocaleString()}자 이하로 입력해주세요.`;
  }
  if (reason) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors: [{ field: 'content', reason }] });
  }
  return content;
}

async function createAnswer(req, res, next) {
  try {
    const questionId = parsePathId(req.params.questionId, 'questionId');
    const answerId = await answerService.createAnswer(req.user.memberId, questionId, parseContent(req.body));
    return success(res, { answerId }, 201);
  } catch (err) {
    return next(err);
  }
}

async function getAnswers(req, res, next) {
  try {
    const data = await answerService.getAnswers(parsePathId(req.params.questionId, 'questionId'));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function updateAnswer(req, res, next) {
  try {
    const answerId = parsePathId(req.params.answerId, 'answerId');
    await answerService.updateAnswer(req.user.memberId, answerId, parseContent(req.body));
    return success(res, { answerId });
  } catch (err) {
    return next(err);
  }
}

async function deleteAnswer(req, res, next) {
  try {
    await answerService.deleteAnswer(req.user, parsePathId(req.params.answerId, 'answerId'));
    return success(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createAnswer, getAnswers, updateAnswer, deleteAnswer };
