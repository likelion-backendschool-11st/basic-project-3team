const pool = require('../config/db');

async function existsCategory(categoryId) {
  const [rows] = await pool.query('SELECT 1 FROM category WHERE category_id = ?', [categoryId]);
  return rows.length > 0;
}

// tag.name은 대소문자 무시 collation이라 소문자로 넘겨도 그대로 찾는다.
async function findTagIdsByNames(names) {
  if (names.length === 0) {
    return [];
  }
  const [rows] = await pool.query('SELECT tag_id AS tagId FROM tag WHERE name IN (?)', [names]);
  return rows.map((row) => row.tagId);
}

async function insertQuestion(conn, { memberId, categoryId, title, content }) {
  const [result] = await conn.query(
    'INSERT INTO question (member_id, category_id, title, content) VALUES (?, ?, ?, ?)',
    [memberId, categoryId, title, content],
  );
  return result.insertId;
}

async function insertQuestionTags(conn, questionId, tagIds) {
  if (tagIds.length === 0) {
    return;
  }
  await conn.query('INSERT INTO question_tag (question_id, tag_id) VALUES ?', [
    tagIds.map((tagId) => [questionId, tagId]),
  ]);
}

// updated_at을 자기 값으로 지정해 ON UPDATE CURRENT_TIMESTAMP로 수정일이 바뀌지 않게 한다.
async function increaseViewCount(questionId) {
  const [result] = await pool.query(
    `UPDATE question
        SET view_count = view_count + 1, updated_at = updated_at
      WHERE question_id = ? AND deleted = FALSE`,
    [questionId],
  );
  return result.affectedRows > 0;
}

async function findQuestionById(questionId) {
  const [rows] = await pool.query(
    `SELECT q.question_id AS questionId,
            q.title,
            q.content,
            c.category_id AS categoryId,
            c.name AS categoryName,
            m.member_id AS writerId,
            m.nickname AS writerNickname,
            m.bio AS writerBio,
            m.career_years AS writerCareerYears,
            q.view_count AS viewCount,
            q.like_count AS likeCount,
            (SELECT COUNT(*) FROM answer a WHERE a.question_id = q.question_id AND a.deleted = FALSE) AS answerCount,
            q.accepted_answer_id IS NOT NULL AS accepted,
            DATE_FORMAT(q.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            DATE_FORMAT(q.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
       FROM question q
       JOIN member m ON m.member_id = q.member_id
       JOIN category c ON c.category_id = q.category_id
      WHERE q.question_id = ? AND q.deleted = FALSE`,
    [questionId],
  );
  return rows[0] ?? null;
}

module.exports = {
  existsCategory,
  findTagIdsByNames,
  insertQuestion,
  insertQuestionTags,
  increaseViewCount,
  findQuestionById,
};
