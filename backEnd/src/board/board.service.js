const pool = require('../config/db');
const boardRepository = require('./board.repository');
const { findWritableMember, buildProfile } = require('../member/mypage.service');
const { findTagsByQuestionIds } = require('../main/main.repository');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');

async function createQuestion(memberId, { title, content, categoryId, tagNames }) {
  // 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
  await findWritableMember(memberId);

  if (!(await boardRepository.existsCategory(categoryId))) {
    throw new AppError(ErrorCode.CATEGORY_NOT_FOUND);
  }

  const tagIds = await boardRepository.findTagIdsByNames(tagNames);
  if (tagIds.length !== tagNames.length) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'tags', reason: '태그 목록에 없는 태그가 있습니다.' }],
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const questionId = await boardRepository.insertQuestion(conn, { memberId, categoryId, title, content });
    await boardRepository.insertQuestionTags(conn, questionId, tagIds);
    await conn.commit();
    return questionId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
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

module.exports = { createQuestion, getQuestion };
