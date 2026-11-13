const pool = require('../config/db');
const boardRepository = require('./board.repository');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');

// 이미 발급된 Access Token은 정지·탈퇴 뒤에도 30분간 유효하므로 쓰기 작업마다 상태를 확인한다 (docs/auth.md).
async function assertWritableMember(memberId) {
  const status = await boardRepository.findMemberStatus(memberId);
  if (status === null) {
    throw new AppError(ErrorCode.MEMBER_NOT_FOUND);
  }
  if (status === 'BANNED') {
    throw new AppError(ErrorCode.MEMBER_BANNED);
  }
  if (status === 'WITHDRAWN') {
    throw new AppError(ErrorCode.MEMBER_WITHDRAWN);
  }
}

async function createQuestion(memberId, { title, content, categoryId, tagNames }) {
  await assertWritableMember(memberId);

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

module.exports = { createQuestion };
