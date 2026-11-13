const pool = require('../config/db');
const { escapeLike } = require('../utils/sql');

// 태그 목록. keyword가 있으면 이름 부분 일치 (tag.name은 대소문자 무시 collation).
async function findTags(keyword) {
  if (keyword === null) {
    const [rows] = await pool.query('SELECT tag_id AS tagId, name FROM tag ORDER BY name');
    return rows;
  }
  const [rows] = await pool.query('SELECT tag_id AS tagId, name FROM tag WHERE name LIKE ? ORDER BY name', [
    `%${escapeLike(keyword)}%`,
  ]);
  return rows;
}

// 삭제되지 않은 질문에 많이 달린 태그 순. 같으면 이름순. 질문이 없는 태그는 뺀다.
async function findPopularTags(limit) {
  const [rows] = await pool.query(
    `SELECT t.tag_id AS tagId, t.name, COUNT(*) AS questionCount
       FROM question_tag qt
       JOIN question q ON q.question_id = qt.question_id AND q.deleted = FALSE
       JOIN tag t ON t.tag_id = qt.tag_id
      GROUP BY t.tag_id, t.name
      ORDER BY questionCount DESC, t.name
      LIMIT ?`,
    [limit],
  );
  return rows;
}

async function findCategories() {
  const [rows] = await pool.query(
    'SELECT category_id AS categoryId, name FROM category ORDER BY sort_order, category_id',
  );
  return rows;
}

module.exports = { findTags, findPopularTags, findCategories };
