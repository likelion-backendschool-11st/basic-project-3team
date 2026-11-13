const replyRepository = require('./reply.repository');
const { findWritableMember } = require('../member/mypage.service');
const { findWriterProfiles } = require('../answer/answer.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { ROLE } = require('../utils/constants');

// 질문이 삭제되면 답변도 함께 삭제되므로 answer.deleted만 보면 된다.
async function assertAnswerExists(answerId) {
  if (!(await replyRepository.existsAnswer(answerId))) {
    throw new AppError(ErrorCode.ANSWER_NOT_FOUND);
  }
}

// 답글 작성 (#71, REQ-ANSWER-009). 채택된 답변에도 달 수 있다.
async function createReply(memberId, answerId, content) {
  // 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
  await findWritableMember(memberId);
  await assertAnswerExists(answerId);
  return replyRepository.insertReply({ answerId, memberId, content });
}

// 답글 목록 (#71, REQ-ANSWER-010). 오래된 순, 페이징 없음
async function getReplies(answerId) {
  await assertAnswerExists(answerId);
  const rows = await replyRepository.findRepliesByAnswerId(answerId);
  const profiles = await findWriterProfiles(rows);
  return rows.map((row) => ({
    replyId: row.replyId,
    content: row.content,
    writer: profiles.get(row.writerId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

async function findReplyWriterId(replyId) {
  const writerId = await replyRepository.findWriterId(replyId);
  if (writerId === null) {
    throw new AppError(ErrorCode.REPLY_NOT_FOUND);
  }
  return writerId;
}

// 답글 수정 (#71, REQ-ANSWER-011). 작성자만, 관리자도 수정은 불가
async function updateReply(memberId, replyId, content) {
  await findWritableMember(memberId);
  if ((await findReplyWriterId(replyId)) !== memberId) {
    throw new AppError(ErrorCode.FORBIDDEN);
  }
  if (!(await replyRepository.updateReplyContent(replyId, content))) {
    throw new AppError(ErrorCode.REPLY_NOT_FOUND);
  }
}

// 답글 삭제 (#71, REQ-ANSWER-011). 작성자·관리자, 숨김 처리
async function deleteReply({ memberId, role }, replyId) {
  await findWritableMember(memberId);
  if ((await findReplyWriterId(replyId)) !== memberId && role !== ROLE.ADMIN) {
    throw new AppError(ErrorCode.FORBIDDEN);
  }
  if (!(await replyRepository.softDeleteReply(replyId))) {
    throw new AppError(ErrorCode.REPLY_NOT_FOUND);
  }
}

module.exports = { createReply, getReplies, updateReply, deleteReply };
