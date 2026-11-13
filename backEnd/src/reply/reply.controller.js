const replyService = require('./reply.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePathId } = require('../utils/params');
const { CONTENT_MIN, CONTENT_MAX } = require('./reply.constants');

// 서버와 DB 글자 수를 같게 이모지 등도 1자로 센다.
const charLength = (str) => [...str].length;

// 공백만 있으면 안 되고(REQ-ANSWER-009 "비어 있으면 등록 불가"), 최대 500자
function parseContent(body) {
  const content = body?.content;
  let reason = null;
  if (typeof content !== 'string' || charLength(content.trim()) < CONTENT_MIN) {
    reason = '답글 내용을 입력해주세요.';
  } else if (charLength(content) > CONTENT_MAX) {
    reason = `답글은 ${CONTENT_MAX}자 이하로 입력해주세요.`;
  }
  if (reason) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors: [{ field: 'content', reason }] });
  }
  return content;
}

async function getReplies(req, res, next) {
  try {
    const data = await replyService.getReplies(parsePathId(req.params.answerId, 'answerId'));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function createReply(req, res, next) {
  try {
    const answerId = parsePathId(req.params.answerId, 'answerId');
    const replyId = await replyService.createReply(req.user.memberId, answerId, parseContent(req.body));
    return success(res, { replyId }, 201);
  } catch (err) {
    return next(err);
  }
}

async function updateReply(req, res, next) {
  try {
    const replyId = parsePathId(req.params.replyId, 'replyId');
    await replyService.updateReply(req.user.memberId, replyId, parseContent(req.body));
    return success(res, { replyId });
  } catch (err) {
    return next(err);
  }
}

async function deleteReply(req, res, next) {
  try {
    await replyService.deleteReply(req.user, parsePathId(req.params.replyId, 'replyId'));
    return success(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getReplies, createReply, updateReply, deleteReply };
