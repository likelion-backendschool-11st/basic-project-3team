const pool = require('../config/db');

// collation(utf8mb4_0900_ai_ci)이 대소문자를 구분하지 않으므로 login_id·nickname 비교도 대소문자를 무시한다.
async function existsByLoginId(loginId) {
  const [rows] = await pool.query('SELECT EXISTS(SELECT 1 FROM member WHERE login_id = ?) AS found', [loginId]);
  return Boolean(rows[0].found);
}

async function existsByPhone(phone) {
  const [rows] = await pool.query('SELECT EXISTS(SELECT 1 FROM member WHERE phone = ?) AS found', [phone]);
  return Boolean(rows[0].found);
}

async function existsByNickname(nickname) {
  const [rows] = await pool.query('SELECT EXISTS(SELECT 1 FROM member WHERE nickname = ?) AS found', [nickname]);
  return Boolean(rows[0].found);
}

async function insertMember({ loginId, passwordHash, phone, nickname }) {
  const [result] = await pool.query(
    'INSERT INTO member (login_id, password_hash, phone, nickname) VALUES (?, ?, ?, ?)',
    [loginId, passwordHash, phone, nickname],
  );
  return result.insertId;
}

// 탈퇴 처리 중 다른 요청이 같은 회원을 바꾸지 못하게 잠근다.
async function findMemberForUpdate(conn, memberId) {
  const [rows] = await conn.query(
    'SELECT member_id AS memberId, password_hash AS passwordHash, role, status FROM member WHERE member_id = ? FOR UPDATE',
    [memberId],
  );
  return rows[0] ?? null;
}

// 개인정보를 지우고 상태를 WITHDRAWN으로 바꾼다. 작성한 질문·답변·답글은 남긴다.
async function anonymizeMember(conn, memberId, { loginId, phone, nickname, passwordHash, status }) {
  await conn.query(
    `UPDATE member
        SET login_id = ?, phone = ?, nickname = ?, password_hash = ?, status = ?,
            bio = NULL, career_years = NULL, notification_enabled = FALSE
      WHERE member_id = ?`,
    [loginId, phone, nickname, passwordHash, status, memberId],
  );
}

// 탈퇴한 회원에게만 의미 있는 데이터(관심사, 기술 스택, 로그인 토큰, 받은 알림)를 지운다.
async function deletePersonalData(conn, memberId) {
  await conn.query('DELETE FROM member_category WHERE member_id = ?', [memberId]);
  await conn.query('DELETE FROM member_tech_stack WHERE member_id = ?', [memberId]);
  await conn.query('DELETE FROM refresh_token WHERE member_id = ?', [memberId]);
  await conn.query('DELETE FROM notification WHERE member_id = ?', [memberId]);
}

module.exports = {
  existsByLoginId,
  existsByPhone,
  existsByNickname,
  insertMember,
  findMemberForUpdate,
  anonymizeMember,
  deletePersonalData,
};
