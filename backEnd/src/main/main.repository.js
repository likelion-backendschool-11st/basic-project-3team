const pool = require('../config/db');
const { QUESTION_SORT } = require('./main.constants');

// ORDER BY에는 플레이스홀더를 쓸 수 없으므로 허용 목록의 값만 넣는다. 값이 같으면 최신순.
const ORDER_BY = Object.freeze({
  [QUESTION_SORT.LATEST]: 'q.created_at DESC, q.question_id DESC',
  [QUESTION_SORT.VIEWS]: 'q.view_count DESC, q.created_at DESC, q.question_id DESC',
  [QUESTION_SORT.ANSWERS]: 'answerCount DESC, q.created_at DESC, q.question_id DESC',
  [QUESTION_SORT.LIKES]: 'q.like_count DESC, q.created_at DESC, q.question_id DESC',
});

async function findQuestions({ sort, limit, offset }) {
  const orderBy = ORDER_BY[sort];
  if (!orderBy) {
    throw new Error(`허용되지 않은 정렬 값입니다: ${sort}`);
  }
  const [rows] = await pool.query(
    `SELECT q.question_id AS questionId,
            q.title,
            m.member_id AS writerId,
            m.nickname AS writerNickname,
            c.category_id AS categoryId,
            c.name AS categoryName,
            q.accepted_answer_id IS NOT NULL AS accepted,
            q.like_count AS likeCount,
            q.view_count AS viewCount,
            (SELECT COUNT(*) FROM answer a WHERE a.question_id = q.question_id AND a.deleted = FALSE) AS answerCount,
            DATE_FORMAT(q.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM question q
       JOIN member m ON m.member_id = q.member_id
       JOIN category c ON c.category_id = q.category_id
      WHERE q.deleted = FALSE
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows;
}

async function countQuestions() {
  const [rows] = await pool.query('SELECT COUNT(*) AS totalElements FROM question WHERE deleted = FALSE');
  return rows[0].totalElements;
}

async function findTagsByQuestionIds(questionIds) {
  if (questionIds.length === 0) {
    return [];
  }
  const [rows] = await pool.query(
    `SELECT qt.question_id AS questionId, t.name
       FROM question_tag qt
       JOIN tag t ON t.tag_id = qt.tag_id
      WHERE qt.question_id IN (?)
      ORDER BY t.name`,
    [questionIds],
  );
  return rows;
}

module.exports = { findQuestions, countQuestions, findTagsByQuestionIds };
