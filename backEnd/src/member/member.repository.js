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

module.exports = { existsByLoginId, existsByPhone, existsByNickname, insertMember };
