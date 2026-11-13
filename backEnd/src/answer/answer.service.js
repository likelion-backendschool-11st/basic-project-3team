const answerRepository = require('./answer.repository');
const { findWritableMember, buildProfile } = require('../member/mypage.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { withTransaction } = require('../utils/transaction');
const { ROLE } = require('../utils/constants');

async function assertQuestionExists(questionId) {
  if (!(await answerRepository.existsQuestion(questionId))) {
    throw new AppError(ErrorCode.QUESTION_NOT_FOUND);
  }
}

// 답변 작성 (#42, REQ-ANSWER-001)
// shortcut: 질문 작성자에게 보내는 답변 등록 알림(ANSWER_CREATED)은 알림 기능(#69)이 생기면 여기서 보낸다.
async function createAnswer(memberId, questionId, content) {
  // 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
  await findWritableMember(memberId);
  await assertQuestionExists(questionId);
  return answerRepository.insertAnswer({ questionId, memberId, content });
}

// 답변 목록 (#42, REQ-ANSWER-002). 페이징하지 않는다.
// shortcut: optionalAuth 미들웨어가 없어 조회자를 알 수 없으므로 liked는 항상 false. optionalAuth가 생기면 채운다.
async function getAnswers(questionId) {
  await assertQuestionExists(questionId);
  const rows = await answerRepository.findAnswersByQuestionId(questionId);

  // 작성자 정보(등급·채택률 등)는 사람마다 한 번만 계산한다.
  const writers = new Map(rows.map((row) => [row.writerId, row]));
  const profiles = new Map(
    await Promise.all(
      [...writers.values()].map(async (row) => {
        const { memberId, nickname, careerYears, techStacks, grade, acceptRate } = await buildProfile({
          memberId: row.writerId,
          nickname: row.writerNickname,
          bio: row.writerBio,
          careerYears: row.writerCareerYears,
        });
        return [memberId, { memberId, nickname, careerYears, techStacks, grade, acceptRate }];
      }),
    ),
  );

  return {
    answerCount: rows.length,
    answers: rows.map((row) => ({
      answerId: row.answerId,
      content: row.content,
      writer: profiles.get(row.writerId),
      likeCount: row.likeCount,
      liked: false,
      accepted: Boolean(row.accepted),
      acceptedAt: row.acceptedAt,
      replyCount: Number(row.replyCount),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  };
}

// 답변 수정 (#43, REQ-ANSWER-003). 작성자만 수정할 수 있고(관리자 포함 다른 회원은 403), 채택된 답변은 409.
async function updateAnswer(memberId, answerId, content) {
  await findWritableMember(memberId);
  await withTransaction(async (conn) => {
    const answer = await answerRepository.findAnswerForUpdate(conn, answerId);
    if (answer === null) {
      throw new AppError(ErrorCode.ANSWER_NOT_FOUND);
    }
    if (answer.memberId !== memberId) {
      throw new AppError(ErrorCode.FORBIDDEN);
    }
    if (answer.accepted) {
      throw new AppError(ErrorCode.ACCEPTED_ANSWER_LOCKED);
    }
    await answerRepository.updateAnswerContent(conn, answerId, content);
  });
}

// 답변 삭제 (#44, REQ-ANSWER-004). 작성자는 채택되지 않은 답변만, 관리자는 채택된 답변도 지울 수 있다.
// 관리자가 채택된 답변을 지워도 question.accepted_answer_id는 그대로 둔다 (해결 표시 유지, 다시 채택 불가).
async function deleteAnswer({ memberId, role }, answerId) {
  await findWritableMember(memberId);
  await withTransaction(async (conn) => {
    const answer = await answerRepository.findAnswerForUpdate(conn, answerId);
    if (answer === null) {
      throw new AppError(ErrorCode.ANSWER_NOT_FOUND);
    }
    if (role !== ROLE.ADMIN) {
      if (answer.memberId !== memberId) {
        throw new AppError(ErrorCode.FORBIDDEN);
      }
      if (answer.accepted) {
        throw new AppError(ErrorCode.ACCEPTED_ANSWER_LOCKED);
      }
    }
    await answerRepository.softDeleteRepliesByAnswerId(conn, answerId);
    await answerRepository.softDeleteAnswer(conn, answerId);
  });
}

module.exports = { createAnswer, getAnswers, updateAnswer, deleteAnswer };
