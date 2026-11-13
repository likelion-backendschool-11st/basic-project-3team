const pool = require('../config/db');

async function existsQuestion(questionId) {
  const [rows] = await pool.query('SELECT 1 FROM question WHERE question_id = ? AND deleted = FALSE', [questionId]);
  return rows.length > 0;
}

async function insertAnswer({ questionId, memberId, content }) {
  const [result] = await pool.query('INSERT INTO answer (question_id, member_id, content) VALUES (?, ?, ?)', [
    questionId,
    memberId,
    content,
  ]);
  return result.insertId;
}

// 채택된 답변 → 좋아요 많은 순 → 최신순 (REQ-ANSWER-002). 채택 여부는 question.accepted_answer_id로 판단한다.
async function findAnswersByQuestionId(questionId) {
  const [rows] = await pool.query(
    `SELECT a.answer_id AS answerId,
            a.content,
            m.member_id AS writerId,
            m.nickname AS writerNickname,
            m.bio AS writerBio,
            m.career_years AS writerCareerYears,
            a.like_count AS likeCount,
            COALESCE(q.accepted_answer_id = a.answer_id, FALSE) AS accepted,
            IF(q.accepted_answer_id = a.answer_id, DATE_FORMAT(q.accepted_at, '%Y-%m-%dT%H:%i:%s'), NULL) AS acceptedAt,
            (SELECT COUNT(*) FROM reply r WHERE r.answer_id = a.answer_id AND r.deleted = FALSE) AS replyCount,
            DATE_FORMAT(a.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            DATE_FORMAT(a.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
       JOIN member m ON m.member_id = a.member_id
      WHERE a.question_id = ? AND a.deleted = FALSE
      ORDER BY accepted DESC, a.like_count DESC, a.created_at DESC, a.answer_id DESC`,
    [questionId],
  );
  return rows;
}

module.exports = { existsQuestion, insertAnswer, findAnswersByQuestionId };
