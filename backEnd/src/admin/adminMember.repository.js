const pool = require('../config/db');
const { REPORT_STATUS } = require('./admin.constants');
const { escapeLike } = require('../utils/sql');

// 회원 글(질문·답변)이 처리 완료(RESOLVED)된 신고 횟수. 정지 판단 참고용 (docs/api.md 11장)
const REPORTED_COUNT = `
       (SELECT COUNT(*)
          FROM report r
          JOIN question q ON q.question_id = r.target_id
         WHERE r.target_type = 'QUESTION' AND r.status = ? AND q.member_id = m.member_id)
     + (SELECT COUNT(*)
          FROM report r
          JOIN answer a ON a.answer_id = r.target_id
         WHERE r.target_type = 'ANSWER' AND r.status = ? AND a.member_id = m.member_id)`;

// keyword는 아이디·닉네임 부분 일치. 사용자 입력은 모두 ? 플레이스홀더로 넘긴다.
function buildMemberWhere({ status, keyword }) {
  const conditions = [];
  const params = [];
  if (status !== null) {
    conditions.push('m.status = ?');
    params.push(status);
  }
  if (keyword !== null) {
    const pattern = `%${escapeLike(keyword)}%`;
    conditions.push('(m.login_id LIKE ? OR m.nickname LIKE ?)');
    params.push(pattern, pattern);
  }
  return { where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

async function findMembers(condition, { limit, offset }) {
  const { where, params } = buildMemberWhere(condition);
  const [rows] = await pool.query(
    `SELECT m.member_id AS memberId,
            m.login_id AS loginId,
            m.nickname,
            m.role,
            m.status,
            ${REPORTED_COUNT} AS reportedCount,
            DATE_FORMAT(m.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM member m
       ${where}
      ORDER BY m.created_at DESC, m.member_id DESC
      LIMIT ? OFFSET ?`,
    [REPORT_STATUS.RESOLVED, REPORT_STATUS.RESOLVED, ...params, limit, offset],
  );
  return rows;
}

async function countMembers(condition) {
  const { where, params } = buildMemberWhere(condition);
  const [rows] = await pool.query(`SELECT COUNT(*) AS totalElements FROM member m ${where}`, params);
  return rows[0].totalElements;
}

// 상태를 바꾸는 동안 같은 회원의 다른 변경이 끼어들지 않게 잠근다.
async function findMemberForUpdate(conn, memberId) {
  const [rows] = await conn.query(
    'SELECT member_id AS memberId, role, status FROM member WHERE member_id = ? FOR UPDATE',
    [memberId],
  );
  return rows[0] ?? null;
}

async function updateMemberStatus(conn, memberId, status) {
  await conn.query('UPDATE member SET status = ? WHERE member_id = ?', [status, memberId]);
}

module.exports = { findMembers, countMembers, findMemberForUpdate, updateMemberStatus };
