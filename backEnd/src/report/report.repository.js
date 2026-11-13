const pool = require('../config/db');

// 삭제되지 않은 질문의 작성자 ID. 없거나 삭제됐으면 null
async function findQuestionWriterId(questionId) {
  const [rows] = await pool.query(
    'SELECT member_id AS writerId FROM question WHERE question_id = ? AND deleted = FALSE',
    [questionId],
  );
  return rows.length > 0 ? rows[0].writerId : null;
}

// 삭제되지 않은 답변의 작성자 ID. 없거나 삭제됐으면 null
// 질문이 삭제되면 답변도 함께 조회되지 않으므로 (docs/api.md 4장 삭제), 질문까지 살아 있어야 한다.
async function findAnswerWriterId(answerId) {
  const [rows] = await pool.query(
    `SELECT a.member_id AS writerId
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
      WHERE a.answer_id = ? AND a.deleted = FALSE AND q.deleted = FALSE`,
    [answerId],
  );
  return rows.length > 0 ? rows[0].writerId : null;
}

// 같은 회원이 같은 대상을 다시 신고하면 uk_report(reporter_id, target_type, target_id)로 ER_DUP_ENTRY가 난다.
async function insertReport({ reporterId, targetType, targetId, reason, reasonDetail }) {
  const [result] = await pool.query(
    `INSERT INTO report (reporter_id, target_type, target_id, reason, reason_detail)
     VALUES (?, ?, ?, ?, ?)`,
    [reporterId, targetType, targetId, reason, reasonDetail],
  );
  return result.insertId;
}

module.exports = { findQuestionWriterId, findAnswerWriterId, insertReport };
