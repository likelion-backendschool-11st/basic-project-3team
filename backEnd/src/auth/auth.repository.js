const pool = require('../config/db');

// collation(utf8mb4_0900_ai_ci)이 대소문자를 구분하지 않으므로 login_id도 대소문자를 무시하고 찾는다.
async function findMemberByLoginId(loginId) {
  const [rows] = await pool.query(
    `SELECT member_id AS memberId, password_hash AS passwordHash, nickname, role, status
       FROM member
      WHERE login_id = ?`,
    [loginId],
  );
  return rows[0] ?? null;
}

// 아이디 찾기: 닉네임 + 전화번호가 모두 일치하는 회원
async function findMemberByNicknameAndPhone(nickname, phone) {
  const [rows] = await pool.query(
    `SELECT login_id AS loginId, nickname, status,
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM member
      WHERE nickname = ? AND phone = ?`,
    [nickname, phone],
  );
  return rows[0] ?? null;
}

// 비밀번호 재설정: 아이디 + 전화번호가 모두 일치하는 회원
async function findMemberByLoginIdAndPhone(loginId, phone) {
  const [rows] = await pool.query('SELECT member_id AS memberId, status FROM member WHERE login_id = ? AND phone = ?', [
    loginId,
    phone,
  ]);
  return rows[0] ?? null;
}

async function updatePasswordHash(conn, memberId, passwordHash) {
  await conn.query('UPDATE member SET password_hash = ? WHERE member_id = ?', [passwordHash, memberId]);
}

async function findMemberById(memberId) {
  const [rows] = await pool.query(
    'SELECT member_id AS memberId, nickname, role, status FROM member WHERE member_id = ?',
    [memberId],
  );
  return rows[0] ?? null;
}

async function findRefreshToken(memberId) {
  const [rows] = await pool.query(
    'SELECT token_hash AS tokenHash, expires_at AS expiresAt FROM refresh_token WHERE member_id = ?',
    [memberId],
  );
  return rows[0] ?? null;
}

// 회원당 1개만 두므로 이미 있으면 새 값으로 바꾼다.
async function saveRefreshToken({ memberId, tokenHash, expiresAt }, conn = pool) {
  await conn.query(
    `INSERT INTO refresh_token (member_id, token_hash, expires_at) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
    [memberId, tokenHash, expiresAt],
  );
}

// 저장된 토큰이 oldTokenHash일 때만 교체한다. 같은 토큰으로 동시에 재발급하면 한 요청만 성공한다.
async function rotateRefreshToken({ memberId, oldTokenHash, tokenHash, expiresAt }) {
  const [result] = await pool.query(
    'UPDATE refresh_token SET token_hash = ?, expires_at = ? WHERE member_id = ? AND token_hash = ?',
    [tokenHash, expiresAt, memberId, oldTokenHash],
  );
  return result.affectedRows === 1;
}

// conn을 넘기면 그 트랜잭션 안에서 삭제한다.
async function deleteRefreshToken(memberId, conn = pool) {
  await conn.query('DELETE FROM refresh_token WHERE member_id = ?', [memberId]);
}

module.exports = {
  findMemberByLoginId,
  findMemberByNicknameAndPhone,
  findMemberByLoginIdAndPhone,
  updatePasswordHash,
  findMemberById,
  findRefreshToken,
  saveRefreshToken,
  rotateRefreshToken,
  deleteRefreshToken,
};
