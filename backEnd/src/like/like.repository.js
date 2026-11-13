// target은 like.constants.js의 LIKE_TARGETS 값이다. 테이블·컬럼 이름은 그 허용 목록에서만 오고, 값은 모두 ?로 넘긴다.

// 트랜잭션 안에서 대상 행을 잠가, 확인과 like_count 변경 사이에 삭제되지 않게 한다.
async function findTargetForUpdate(conn, target, targetId) {
  const [rows] = await conn.query(
    `SELECT member_id AS memberId FROM ${target.table} WHERE ${target.idColumn} = ? AND deleted = FALSE FOR UPDATE`,
    [targetId],
  );
  return rows[0] ?? null;
}

// 이미 좋아요한 대상이면 UNIQUE(member_id, 대상 id) 때문에 ER_DUP_ENTRY가 난다.
async function insertLike(conn, target, memberId, targetId) {
  await conn.query(`INSERT INTO ${target.likeTable} (member_id, ${target.idColumn}) VALUES (?, ?)`, [
    memberId,
    targetId,
  ]);
}

// 좋아요 취소는 행을 실제로 지운다 (docs/04-db.md). 지운 행이 없으면 false
async function deleteLike(conn, target, memberId, targetId) {
  const [result] = await conn.query(`DELETE FROM ${target.likeTable} WHERE member_id = ? AND ${target.idColumn} = ?`, [
    memberId,
    targetId,
  ]);
  return result.affectedRows > 0;
}

// updated_at을 자기 값으로 지정해 좋아요만으로 수정일이 바뀌지 않게 한다.
async function changeLikeCount(conn, target, targetId, delta) {
  await conn.query(
    `UPDATE ${target.table} SET like_count = like_count + ?, updated_at = updated_at WHERE ${target.idColumn} = ?`,
    [delta, targetId],
  );
}

async function findLikeCount(conn, target, targetId) {
  const [rows] = await conn.query(`SELECT like_count AS likeCount FROM ${target.table} WHERE ${target.idColumn} = ?`, [
    targetId,
  ]);
  return rows[0].likeCount;
}

module.exports = { findTargetForUpdate, insertLike, deleteLike, changeLikeCount, findLikeCount };
