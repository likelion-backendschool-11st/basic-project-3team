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

// 수정·삭제 트랜잭션 안에서 답변과 질문 행을 잠가, 확인과 변경 사이에 채택이 끼어들지 않게 한다.
async function findAnswerForUpdate(conn, answerId) {
  const [rows] = await conn.query(
    `SELECT a.member_id AS memberId, a.question_id AS questionId,
            COALESCE(q.accepted_answer_id = a.answer_id, FALSE) AS accepted,
            q.member_id AS questionWriterId,
            q.accepted_answer_id IS NOT NULL AS questionAccepted
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
      WHERE a.answer_id = ? AND a.deleted = FALSE
        FOR UPDATE`,
    [answerId],
  );
  return rows[0] ?? null;
}

async function updateAnswerContent(conn, answerId, content) {
  await conn.query('UPDATE answer SET content = ? WHERE answer_id = ?', [content, answerId]);
}

// 이미 삭제된 답글은 건드리지 않아 원래 삭제 시각을 유지한다.
async function softDeleteRepliesByAnswerId(conn, answerId) {
  await conn.query('UPDATE reply SET deleted = TRUE, deleted_at = NOW() WHERE answer_id = ? AND deleted = FALSE', [
    answerId,
  ]);
}

async function softDeleteAnswer(conn, answerId) {
  await conn.query('UPDATE answer SET deleted = TRUE, deleted_at = NOW() WHERE answer_id = ?', [answerId]);
}

// docs/04-db.md 채택 규칙: 조건부 UPDATE. 바뀐 행이 0개면 이미 채택된 질문이다.
async function acceptAnswer(conn, questionId, answerId) {
  const [result] = await conn.query(
    `UPDATE question SET accepted_answer_id = ?, accepted_at = NOW()
      WHERE question_id = ? AND accepted_answer_id IS NULL AND deleted = FALSE`,
    [answerId, questionId],
  );
  return result.affectedRows > 0;
}

module.exports = {
  existsQuestion,
  insertAnswer,
  findAnswersByQuestionId,
  findAnswerForUpdate,
  updateAnswerContent,
  softDeleteRepliesByAnswerId,
  softDeleteAnswer,
  acceptAnswer,
};
