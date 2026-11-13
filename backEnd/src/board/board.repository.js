const pool = require('../config/db');
const { escapeLike } = require('../utils/sql');

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
// 작성자 본인 조회는 올리지 않는다 (member_id <> 조회자). 비로그인은 0으로 넘겨 모든 조회를 센다 (member_id는 1부터).
async function increaseViewCount(questionId, viewerId) {
  await pool.query(
    `UPDATE question
        SET view_count = view_count + 1, updated_at = updated_at
      WHERE question_id = ? AND deleted = FALSE AND member_id <> ?`,
    [questionId, viewerId ?? 0],
  );
}

// liked: 조회자가 좋아요했는지. 비로그인은 0으로 넘겨 항상 false
async function findQuestionById(questionId, viewerId) {
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
            EXISTS (SELECT 1 FROM question_like ql WHERE ql.question_id = q.question_id AND ql.member_id = ?) AS liked,
            (SELECT COUNT(*) FROM answer a WHERE a.question_id = q.question_id AND a.deleted = FALSE) AS answerCount,
            q.accepted_answer_id IS NOT NULL AS accepted,
            DATE_FORMAT(q.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            DATE_FORMAT(q.updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
       FROM question q
       JOIN member m ON m.member_id = q.member_id
       JOIN category c ON c.category_id = q.category_id
      WHERE q.question_id = ? AND q.deleted = FALSE`,
    [viewerId ?? 0, questionId],
  );
  return rows[0] ?? null;
}

async function findWriterId(questionId) {
  const [rows] = await pool.query('SELECT member_id AS memberId FROM question WHERE question_id = ? AND deleted = FALSE', [
    questionId,
  ]);
  return rows[0]?.memberId ?? null;
}

// SET에 넣는 컬럼 이름은 이 허용 목록에서만 가져오고, 값은 모두 플레이스홀더로 넘긴다.
const UPDATABLE_COLUMNS = Object.freeze({ title: 'title', content: 'content', categoryId: 'category_id' });

// 태그만 바꿔도 수정일이 바뀌도록 updated_at은 항상 NOW()로 지정한다. 삭제된 질문이면 false.
async function updateQuestion(conn, questionId, fields) {
  const keys = Object.keys(UPDATABLE_COLUMNS).filter((key) => fields[key] !== undefined);
  const sets = keys.map((key) => `${UPDATABLE_COLUMNS[key]} = ?`).concat('updated_at = NOW()');
  const [result] = await conn.query(
    `UPDATE question SET ${sets.join(', ')} WHERE question_id = ? AND deleted = FALSE`,
    [...keys.map((key) => fields[key]), questionId],
  );
  return result.affectedRows > 0;
}

async function deleteQuestionTags(conn, questionId) {
  await conn.query('DELETE FROM question_tag WHERE question_id = ?', [questionId]);
}

// 삭제 트랜잭션 안에서 행을 잠가, 확인과 삭제 사이에 답변이 채택되지 않게 한다.
async function findQuestionForUpdate(conn, questionId) {
  const [rows] = await conn.query(
    `SELECT member_id AS memberId, accepted_answer_id IS NOT NULL AS accepted
       FROM question
      WHERE question_id = ? AND deleted = FALSE
        FOR UPDATE`,
    [questionId],
  );
  return rows[0] ?? null;
}

// 이미 삭제된 답변·답글은 건드리지 않아 원래 삭제 시각을 유지한다.
async function softDeleteRepliesByQuestionId(conn, questionId) {
  await conn.query(
    `UPDATE reply r
       JOIN answer a ON a.answer_id = r.answer_id
        SET r.deleted = TRUE, r.deleted_at = NOW()
      WHERE a.question_id = ? AND r.deleted = FALSE`,
    [questionId],
  );
}

async function softDeleteAnswersByQuestionId(conn, questionId) {
  await conn.query('UPDATE answer SET deleted = TRUE, deleted_at = NOW() WHERE question_id = ? AND deleted = FALSE', [
    questionId,
  ]);
}

async function softDeleteQuestion(conn, questionId) {
  await conn.query('UPDATE question SET deleted = TRUE, deleted_at = NOW() WHERE question_id = ?', [questionId]);
}

async function findTitleAndTagIds(questionId) {
  const [rows] = await pool.query('SELECT title FROM question WHERE question_id = ? AND deleted = FALSE', [questionId]);
  if (rows.length === 0) {
    return null;
  }
  const [tagRows] = await pool.query('SELECT tag_id AS tagId FROM question_tag WHERE question_id = ?', [questionId]);
  return { title: rows[0].title, tagIds: tagRows.map((row) => row.tagId) };
}

// 유사 질문 후보: 태그가 1개 이상 겹치거나 제목에 단어 중 하나가 들어간 질문 (현재·삭제된 질문 제외)
// 정렬: 해결됨 → 겹치는 태그 수 → 좋아요 → 최신순. 조건 SQL은 정해 둔 조각만 잇고, 값은 모두 ?로 넘긴다.
// 열 별칭은 main.service.js의 toListItem 형식이다.
async function findSimilarQuestions({ questionId, tagIds, words, limit }) {
  const hasTags = tagIds.length > 0;
  const overlap = hasTags
    ? '(SELECT COUNT(*) FROM question_tag sqt WHERE sqt.question_id = q.question_id AND sqt.tag_id IN (?))'
    : '0';
  const tagMatch =
    'EXISTS (SELECT 1 FROM question_tag cqt WHERE cqt.question_id = q.question_id AND cqt.tag_id IN (?))';
  const candidates = [...(hasTags ? [tagMatch] : []), ...words.map(() => 'q.title LIKE ?')];
  const params = [
    ...(hasTags ? [tagIds] : []),
    questionId,
    ...(hasTags ? [tagIds] : []),
    ...words.map((word) => `%${escapeLike(word)}%`),
    limit,
  ];
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
            DATE_FORMAT(q.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            ${overlap} AS overlapCount
       FROM question q
       JOIN member m ON m.member_id = q.member_id
       JOIN category c ON c.category_id = q.category_id
      WHERE q.deleted = FALSE AND q.question_id <> ? AND (${candidates.join(' OR ')})
      ORDER BY accepted DESC, overlapCount DESC, q.like_count DESC, q.created_at DESC, q.question_id DESC
      LIMIT ?`,
    params,
  );
  return rows;
}

module.exports = {
  existsCategory,
  findTagIdsByNames,
  insertQuestion,
  insertQuestionTags,
  increaseViewCount,
  findQuestionById,
  findWriterId,
  updateQuestion,
  deleteQuestionTags,
  findQuestionForUpdate,
  softDeleteRepliesByQuestionId,
  softDeleteAnswersByQuestionId,
  softDeleteQuestion,
  findTitleAndTagIds,
  findSimilarQuestions,
};
