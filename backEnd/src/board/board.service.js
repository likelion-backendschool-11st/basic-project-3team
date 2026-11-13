const boardRepository = require('./board.repository');
const { findWritableMember, buildProfile } = require('../member/mypage.service');
const { findTagsByQuestionIds } = require('../main/main.repository');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { ROLE } = require('../utils/constants');
const { withTransaction } = require('../utils/transaction');

async function assertCategoryExists(categoryId) {
  if (!(await boardRepository.existsCategory(categoryId))) {
    throw new AppError(ErrorCode.CATEGORY_NOT_FOUND);
  }
}

// 태그 목록에 없는 이름이 하나라도 있으면 400
async function findTagIds(tagNames) {
  const tagIds = await boardRepository.findTagIdsByNames(tagNames);
  if (tagIds.length !== tagNames.length) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'tags', reason: '태그 목록에 없는 태그가 있습니다.' }],
    });
  }
  return tagIds;
}

async function createQuestion(memberId, { title, content, categoryId, tagNames }) {
  // 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
  await findWritableMember(memberId);
  await assertCategoryExists(categoryId);
  const tagIds = await findTagIds(tagNames);

  return withTransaction(async (conn) => {
    const questionId = await boardRepository.insertQuestion(conn, { memberId, categoryId, title, content });
    await boardRepository.insertQuestionTags(conn, questionId, tagIds);
    return questionId;
  });
}

// 질문 수정 (#40). fields에는 보낸 필드만 있다. tagNames가 있으면 태그 전체를 교체한다.
async function updateQuestion(memberId, questionId, fields) {
  await findWritableMember(memberId);

  const writerId = await boardRepository.findWriterId(questionId);
  if (writerId === null) {
    throw new AppError(ErrorCode.QUESTION_NOT_FOUND);
  }
  if (writerId !== memberId) {
    throw new AppError(ErrorCode.FORBIDDEN);
  }
  if (fields.categoryId !== undefined) {
    await assertCategoryExists(fields.categoryId);
  }
  const tagIds = fields.tagNames === undefined ? null : await findTagIds(fields.tagNames);

  await withTransaction(async (conn) => {
    // 확인한 뒤 그사이 삭제됐으면 404
    if (!(await boardRepository.updateQuestion(conn, questionId, fields))) {
      throw new AppError(ErrorCode.QUESTION_NOT_FOUND);
    }
    if (tagIds !== null) {
      await boardRepository.deleteQuestionTags(conn, questionId);
      await boardRepository.insertQuestionTags(conn, questionId, tagIds);
    }
  });
}

// 상세 조회 (#39) + 조회수 1 증가 (#55). 응답에는 올린 뒤의 조회수가 담긴다.
// shortcut: optionalAuth 미들웨어가 없어 조회자를 알 수 없다. liked는 항상 false이고 작성자 본인 조회도 조회수를 올린다.
//           optionalAuth가 생기면 viewerId를 받아 둘 다 처리한다.
async function getQuestion(questionId) {
  if (!(await boardRepository.increaseViewCount(questionId))) {
    throw new AppError(ErrorCode.QUESTION_NOT_FOUND);
  }
  const row = await boardRepository.findQuestionById(questionId);
  if (row === null) {
    throw new AppError(ErrorCode.QUESTION_NOT_FOUND);
  }
  const [tagRows, profile] = await Promise.all([
    findTagsByQuestionIds([questionId]),
    buildProfile({
      memberId: row.writerId,
      nickname: row.writerNickname,
      bio: row.writerBio,
      careerYears: row.writerCareerYears,
    }),
  ]);
  const { memberId, nickname, careerYears, techStacks, grade, acceptRate } = profile;

  return {
    questionId: row.questionId,
    title: row.title,
    content: row.content,
    category: { categoryId: row.categoryId, name: row.categoryName },
    tags: tagRows.map((tag) => tag.name),
    writer: { memberId, nickname, careerYears, techStacks, grade, acceptRate },
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    liked: false,
    answerCount: Number(row.answerCount),
    accepted: Boolean(row.accepted),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// 질문 삭제 (#41). 관리자 신고 처리(#51)에서도 자기 트랜잭션 안에서 isAdmin: true로 호출할 수 있다.
// 작성자는 채택된 답변이 있으면 지울 수 없고, 관리자는 채택 여부와 관계없이 지울 수 있다.
async function removeQuestion(conn, questionId, { memberId, isAdmin }) {
  const question = await boardRepository.findQuestionForUpdate(conn, questionId);
  if (question === null) {
    throw new AppError(ErrorCode.QUESTION_NOT_FOUND);
  }
  if (!isAdmin) {
    if (question.memberId !== memberId) {
      throw new AppError(ErrorCode.FORBIDDEN);
    }
    if (question.accepted) {
      throw new AppError(ErrorCode.QUESTION_HAS_ACCEPTED_ANSWER);
    }
  }
  await boardRepository.softDeleteRepliesByQuestionId(conn, questionId);
  await boardRepository.softDeleteAnswersByQuestionId(conn, questionId);
  await boardRepository.softDeleteQuestion(conn, questionId);
}

async function deleteQuestion({ memberId, role }, questionId) {
  await findWritableMember(memberId);
  await withTransaction((conn) => removeQuestion(conn, questionId, { memberId, isAdmin: role === ROLE.ADMIN }));
}

module.exports = { createQuestion, getQuestion, updateQuestion, deleteQuestion, removeQuestion };
