const pool = require('../config/db');
const { QUESTION_SORT, SEARCH_SCOPE } = require('./question.constants');
const { escapeLike } = require('../utils/sql');

// ORDER BY에는 플레이스홀더를 쓸 수 없으므로 허용 목록의 값만 넣는다. 값이 같으면 최신순.
const ORDER_BY = Object.freeze({
  [QUESTION_SORT.LATEST]: 'q.created_at DESC, q.question_id DESC',
  [QUESTION_SORT.VIEWS]: 'q.view_count DESC, q.created_at DESC, q.question_id DESC',
  [QUESTION_SORT.ANSWERS]: 'answerCount DESC, q.created_at DESC, q.question_id DESC',
  [QUESTION_SORT.LIKES]: 'q.like_count DESC, q.created_at DESC, q.question_id DESC',
});

const TITLE_LIKE = 'q.title LIKE ?';
const CONTENT_LIKE = 'q.content LIKE ?';
const TAG_LIKE = `EXISTS (SELECT 1
                            FROM question_tag kqt
                            JOIN tag kt ON kt.tag_id = kqt.tag_id
                           WHERE kqt.question_id = q.question_id AND kt.name LIKE ?)`;

// 검색 범위별 조건. 각 조건에 검색어 패턴 하나가 들어간다.
const SCOPE_CONDITIONS = Object.freeze({
  [SEARCH_SCOPE.ALL]: [TITLE_LIKE, CONTENT_LIKE, TAG_LIKE],
  [SEARCH_SCOPE.TITLE]: [TITLE_LIKE],
  [SEARCH_SCOPE.CONTENT]: [CONTENT_LIKE],
  [SEARCH_SCOPE.TAG]: [TAG_LIKE],
});

// 조건 SQL은 위에 정해 둔 조각만 이어 붙이고, 사용자 입력은 모두 params(? 플레이스홀더)로 넘긴다.
function buildWhere({ keyword, scope, categoryId, tags, startDate, endDate, accepted }) {
  const conditions = ['q.deleted = FALSE'];
  const params = [];

  if (keyword !== null) {
    const scopeConditions = SCOPE_CONDITIONS[scope];
    if (!scopeConditions) {
      throw new Error(`허용되지 않은 검색 범위입니다: ${scope}`);
    }
    const pattern = `%${escapeLike(keyword)}%`;
    conditions.push(`(${scopeConditions.join(' OR ')})`);
    scopeConditions.forEach(() => params.push(pattern));
  }
  if (categoryId !== null) {
    conditions.push('q.category_id = ?');
    params.push(categoryId);
  }
  if (tags.length > 0) {
    // 선택한 태그가 모두 달린 질문. tags는 중복을 지운 값이라 개수로 비교할 수 있다.
    conditions.push(`q.question_id IN (SELECT qt.question_id
                                         FROM question_tag qt
                                         JOIN tag t ON t.tag_id = qt.tag_id
                                        WHERE t.name IN (?)
                                        GROUP BY qt.question_id
                                       HAVING COUNT(*) = ?)`);
    params.push(tags, tags.length);
  }
  if (startDate !== null) {
    conditions.push('q.created_at >= ?');
    params.push(startDate);
  }
  if (endDate !== null) {
    conditions.push('q.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(endDate);
  }
  if (accepted !== null) {
    conditions.push(accepted ? 'q.accepted_answer_id IS NOT NULL' : 'q.accepted_answer_id IS NULL');
  }

  return { where: conditions.join(' AND '), params };
}

async function searchQuestions(condition, { sort, limit, offset }) {
  const orderBy = ORDER_BY[sort];
  if (!orderBy) {
    throw new Error(`허용되지 않은 정렬 값입니다: ${sort}`);
  }
  const { where, params } = buildWhere(condition);
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
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows;
}

async function countQuestions(condition) {
  const { where, params } = buildWhere(condition);
  const [rows] = await pool.query(`SELECT COUNT(*) AS totalElements FROM question q WHERE ${where}`, params);
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

module.exports = { searchQuestions, countQuestions, findTagsByQuestionIds };
