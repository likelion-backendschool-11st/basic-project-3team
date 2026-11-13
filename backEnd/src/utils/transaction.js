const pool = require('../config/db');

// docs/convention.md 트랜잭션 순서: getConnection → beginTransaction → commit / 실패 시 rollback → release
// work(conn)의 반환값을 그대로 돌려준다.
async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { withTransaction };
