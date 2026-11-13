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
async function saveRefreshToken({ memberId, tokenHash, expiresAt }) {
  await pool.query(
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

async function deleteRefreshToken(memberId) {
  await pool.query('DELETE FROM refresh_token WHERE member_id = ?', [memberId]);
}

module.exports = {
  findMemberByLoginId,
  findMemberById,
  findRefreshToken,
  saveRefreshToken,
  rotateRefreshToken,
  deleteRefreshToken,
};
