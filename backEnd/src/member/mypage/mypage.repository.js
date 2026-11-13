const pool = require('../../config/db');
const { POPULAR_ANSWER_LIKE_COUNT } = require('./mypage.constants');

// 프로필 수정에서 바꿀 수 있는 필드 → 컬럼. SET 절에는 이 목록의 컬럼만 넣는다.
const PROFILE_COLUMNS = Object.freeze({
  nickname: 'nickname',
  bio: 'bio',
  careerYears: 'career_years',
});

async function findMemberById(memberId) {
  const [rows] = await pool.query(
    `SELECT member_id AS memberId,
            login_id AS loginId,
            phone,
            nickname,
            bio,
            career_years AS careerYears,
            role,
            status,
            notification_enabled AS notificationEnabled,
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM member
      WHERE member_id = ?`,
    [memberId],
  );
  return rows[0] ?? null;
}

async function findPasswordHash(memberId) {
  const [rows] = await pool.query('SELECT password_hash AS passwordHash FROM member WHERE member_id = ?', [memberId]);
  return rows[0]?.passwordHash ?? null;
}

// 본인을 뺀 다른 회원이 쓰고 있는지. collation이 대소문자를 구분하지 않으므로 닉네임도 대소문자를 무시한다.
async function existsNicknameOfOthers(nickname, memberId) {
  const [rows] = await pool.query(
    'SELECT EXISTS(SELECT 1 FROM member WHERE nickname = ? AND member_id <> ?) AS found',
    [nickname, memberId],
  );
  return Boolean(rows[0].found);
}

async function existsPhoneOfOthers(phone, memberId) {
  const [rows] = await pool.query(
    'SELECT EXISTS(SELECT 1 FROM member WHERE phone = ? AND member_id <> ?) AS found',
    [phone, memberId],
  );
  return Boolean(rows[0].found);
}

async function findTechStackNames(memberId) {
  const [rows] = await pool.query(
    `SELECT t.name
       FROM member_tech_stack mts
       JOIN tag t ON t.tag_id = mts.tag_id
      WHERE mts.member_id = ?
      ORDER BY t.name`,
    [memberId],
  );
  return rows.map((row) => row.name);
}

// 등급·뱃지·채택률 계산용 활동 수. 삭제된 질문·답변은 세지 않는다.
// SUM은 대상 행이 없으면 NULL이고 mysql2는 DECIMAL을 문자열로 주므로, COALESCE 후 Number로 바꾼다.
async function findActivityStats(memberId) {
  const [rows] = await pool.query(
    `SELECT (SELECT COUNT(*) FROM question WHERE member_id = ? AND deleted = FALSE) AS questionCount,
            COUNT(a.answer_id) AS answerCount,
            COALESCE(SUM(q.accepted_answer_id = a.answer_id), 0) AS acceptedCount,
            COALESCE(SUM(a.like_count >= ?), 0) AS popularAnswerCount
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
      WHERE a.member_id = ? AND a.deleted = FALSE`,
    [memberId, POPULAR_ANSWER_LIKE_COUNT, memberId],
  );
  const row = rows[0];
  return {
    questionCount: Number(row.questionCount),
    answerCount: Number(row.answerCount),
    acceptedCount: Number(row.acceptedCount),
    popularAnswerCount: Number(row.popularAnswerCount),
  };
}

// tag.name은 대소문자 무시 collation이라 소문자로 넘겨도 그대로 찾는다.
async function findTagIdsByNames(names) {
  if (names.length === 0) {
    return [];
  }
  const [rows] = await pool.query('SELECT tag_id AS tagId FROM tag WHERE name IN (?)', [names]);
  return rows.map((row) => row.tagId);
}

// fields에서 PROFILE_COLUMNS에 있는 키만 SET 절에 넣는다. 바꿀 값이 없으면 아무것도 하지 않는다.
async function updateProfile(conn, memberId, fields) {
  const entries = Object.entries(fields).filter(([key]) => PROFILE_COLUMNS[key]);
  if (entries.length === 0) {
    return;
  }
  const setClause = entries.map(([key]) => `${PROFILE_COLUMNS[key]} = ?`).join(', ');
  await conn.query(`UPDATE member SET ${setClause} WHERE member_id = ?`, [
    ...entries.map(([, value]) => value),
    memberId,
  ]);
}

async function replaceTechStacks(conn, memberId, tagIds) {
  await conn.query('DELETE FROM member_tech_stack WHERE member_id = ?', [memberId]);
  if (tagIds.length === 0) {
    return;
  }
  await conn.query('INSERT INTO member_tech_stack (member_id, tag_id) VALUES ?', [
    tagIds.map((tagId) => [memberId, tagId]),
  ]);
}

async function updatePasswordHash(conn, memberId, passwordHash) {
  await conn.query('UPDATE member SET password_hash = ? WHERE member_id = ?', [passwordHash, memberId]);
}

async function updatePhone(conn, memberId, phone) {
  await conn.query('UPDATE member SET phone = ? WHERE member_id = ?', [phone, memberId]);
}

async function findCategoryIds(memberId) {
  const [rows] = await pool.query(
    'SELECT category_id AS categoryId FROM member_category WHERE member_id = ? ORDER BY category_id',
    [memberId],
  );
  return rows.map((row) => row.categoryId);
}

async function countCategoriesByIds(categoryIds) {
  if (categoryIds.length === 0) {
    return 0;
  }
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM category WHERE category_id IN (?)', [categoryIds]);
  return rows[0].total;
}

async function replaceCategories(conn, memberId, categoryIds) {
  await conn.query('DELETE FROM member_category WHERE member_id = ?', [memberId]);
  if (categoryIds.length === 0) {
    return;
  }
  await conn.query('INSERT INTO member_category (member_id, category_id) VALUES ?', [
    categoryIds.map((categoryId) => [memberId, categoryId]),
  ]);
}

async function updateNotificationEnabled(conn, memberId, notificationEnabled) {
  await conn.query('UPDATE member SET notification_enabled = ? WHERE member_id = ?', [notificationEnabled, memberId]);
}

// 채택 내역: 내 답변 중 채택된 것, 채택일 최신순
async function findAcceptedAnswers(memberId, { limit, offset }) {
  const [rows] = await pool.query(
    `SELECT a.answer_id AS answerId,
            q.question_id AS questionId,
            q.title AS questionTitle,
            DATE_FORMAT(q.accepted_at, '%Y-%m-%dT%H:%i:%s') AS acceptedAt
       FROM answer a
       JOIN question q ON q.accepted_answer_id = a.answer_id
      WHERE a.member_id = ? AND a.deleted = FALSE AND q.deleted = FALSE
      ORDER BY q.accepted_at DESC, a.answer_id DESC
      LIMIT ? OFFSET ?`,
    [memberId, limit, offset],
  );
  return rows;
}

async function countAcceptedAnswers(memberId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM answer a
       JOIN question q ON q.accepted_answer_id = a.answer_id
      WHERE a.member_id = ? AND a.deleted = FALSE AND q.deleted = FALSE`,
    [memberId],
  );
  return rows[0].total;
}

async function findQuestionsByMember(memberId, { limit, offset }) {
  const [rows] = await pool.query(
    `SELECT question_id AS questionId,
            title,
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            accepted_answer_id IS NOT NULL AS accepted,
            like_count AS likeCount,
            (SELECT COUNT(*) FROM answer a WHERE a.question_id = q.question_id AND a.deleted = FALSE) AS answerCount
       FROM question q
      WHERE member_id = ? AND deleted = FALSE
      ORDER BY created_at DESC, question_id DESC
      LIMIT ? OFFSET ?`,
    [memberId, limit, offset],
  );
  return rows;
}

async function countQuestionsByMember(memberId) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM question WHERE member_id = ? AND deleted = FALSE', [
    memberId,
  ]);
  return rows[0].total;
}

// accepted_answer_id가 NULL이어도 NULL이 아닌 0이 나오도록 <=> 로 비교한다.
async function findAnswersByMember(memberId, { limit, offset }) {
  const [rows] = await pool.query(
    `SELECT a.answer_id AS answerId,
            q.question_id AS questionId,
            q.title,
            DATE_FORMAT(a.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt,
            q.accepted_answer_id <=> a.answer_id AS accepted,
            a.like_count AS likeCount
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
      WHERE a.member_id = ? AND a.deleted = FALSE AND q.deleted = FALSE
      ORDER BY a.created_at DESC, a.answer_id DESC
      LIMIT ? OFFSET ?`,
    [memberId, limit, offset],
  );
  return rows;
}

async function countAnswersByMember(memberId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM answer a
       JOIN question q ON q.question_id = a.question_id
      WHERE a.member_id = ? AND a.deleted = FALSE AND q.deleted = FALSE`,
    [memberId],
  );
  return rows[0].total;
}

module.exports = {
  findMemberById,
  findPasswordHash,
  existsNicknameOfOthers,
  existsPhoneOfOthers,
  findTechStackNames,
  findActivityStats,
  findTagIdsByNames,
  updateProfile,
  replaceTechStacks,
  updatePasswordHash,
  updatePhone,
  findCategoryIds,
  countCategoriesByIds,
  replaceCategories,
  updateNotificationEnabled,
  findAcceptedAnswers,
  countAcceptedAnswers,
  findQuestionsByMember,
  countQuestionsByMember,
  findAnswersByMember,
  countAnswersByMember,
};
