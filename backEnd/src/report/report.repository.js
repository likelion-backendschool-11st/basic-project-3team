const pool = require('../config/db');

async function existsQuestion(questionId) {
  const [rows] = await pool.query('SELECT 1 FROM question WHERE question_id = ? AND deleted = FALSE', [questionId]);
  return rows.length > 0;
}

// 질문이 삭제되면 답변도 함께 조회되지 않으므로 (docs/api.md 4장 삭제), 질문까지 살아 있어야 신고할 수 있다.
async function existsAnswer(answerId) {
  const [rows] = await pool.query(
    `SELECT 1
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
      WHERE a.answer_id = ? AND a.deleted = FALSE AND q.deleted = FALSE`,
    [answerId],
  );
  return rows.length > 0;
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

module.exports = { existsQuestion, existsAnswer, insertReport };
