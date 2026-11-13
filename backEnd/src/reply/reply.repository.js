const pool = require('../config/db');

async function existsAnswer(answerId) {
  const [rows] = await pool.query('SELECT 1 FROM answer WHERE answer_id = ? AND deleted = FALSE', [answerId]);
  return rows.length > 0;
}

async function insertReply({ answerId, memberId, content }) {
  const [result] = await pool.query('INSERT INTO reply (answer_id, member_id, content) VALUES (?, ?, ?)', [
    answerId,
    memberId,
    content,
  ]);
  return result.insertId;
}

// 오래된 순 (REQ-ANSWER-010). 작성자 정보 계산에 쓰는 writer* 별칭은 answer.service.js의 findWriterProfiles 형식이다.
async function findRepliesByAnswerId(answerId) {
  const [rows] = await pool.query(
    `SELECT r.reply_id AS replyId,
            r.content,
            m.member_id AS writerId,
            m.nickname AS writerNickname,
            m.bio AS writerBio,
            m.career_years AS writerCareerYears,
            DATE_FORMAT(r.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            DATE_FORMAT(r.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
       FROM reply r
       JOIN member m ON m.member_id = r.member_id
      WHERE r.answer_id = ? AND r.deleted = FALSE
      ORDER BY r.created_at ASC, r.reply_id ASC`,
    [answerId],
  );
  return rows;
}

async function findWriterId(replyId) {
  const [rows] = await pool.query('SELECT member_id AS memberId FROM reply WHERE reply_id = ? AND deleted = FALSE', [
    replyId,
  ]);
  return rows[0]?.memberId ?? null;
}

// 확인한 뒤 그사이 삭제됐으면 false (deleted = FALSE 조건)
async function updateReplyContent(replyId, content) {
  const [result] = await pool.query('UPDATE reply SET content = ? WHERE reply_id = ? AND deleted = FALSE', [
    content,
    replyId,
  ]);
  return result.affectedRows > 0;
}

async function softDeleteReply(replyId) {
  const [result] = await pool.query(
    'UPDATE reply SET deleted = TRUE, deleted_at = NOW() WHERE reply_id = ? AND deleted = FALSE',
    [replyId],
  );
  return result.affectedRows > 0;
}

module.exports = {
  existsAnswer,
  insertReply,
  findRepliesByAnswerId,
  findWriterId,
  updateReplyContent,
  softDeleteReply,
};
