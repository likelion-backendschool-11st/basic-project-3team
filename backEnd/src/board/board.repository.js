const pool = require('../config/db');

async function findMemberStatus(memberId) {
  const [rows] = await pool.query('SELECT status FROM member WHERE member_id = ?', [memberId]);
  return rows[0]?.status ?? null;
}

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

module.exports = { findMemberStatus, existsCategory, findTagIdsByNames, insertQuestion, insertQuestionTags };
