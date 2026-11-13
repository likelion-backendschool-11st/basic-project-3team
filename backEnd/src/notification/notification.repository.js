const pool = require('../config/db');
const { MEMBER_STATUS } = require('../utils/constants');

const NOTIFICATION_COLUMNS = `
         notification_id AS notificationId,
         type,
         message,
         question_id AS questionId,
         is_read AS isRead,
         DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt`;

async function findNotifications(memberId, { limit, offset }) {
  const [rows] = await pool.query(
    `SELECT ${NOTIFICATION_COLUMNS}
       FROM notification
      WHERE member_id = ?
      ORDER BY created_at DESC, notification_id DESC
      LIMIT ? OFFSET ?`,
    [memberId, limit, offset],
  );
  return rows;
}

async function countNotifications(memberId) {
  const [rows] = await pool.query('SELECT COUNT(*) AS totalElements FROM notification WHERE member_id = ?', [memberId]);
  return rows[0].totalElements;
}

async function countUnread(memberId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS unreadCount FROM notification WHERE member_id = ? AND is_read = FALSE',
    [memberId],
  );
  return rows[0].unreadCount;
}

async function findNotificationOwner(notificationId) {
  const [rows] = await pool.query('SELECT member_id AS memberId FROM notification WHERE notification_id = ?', [
    notificationId,
  ]);
  return rows[0]?.memberId ?? null;
}

async function markRead(notificationId) {
  await pool.query('UPDATE notification SET is_read = TRUE WHERE notification_id = ?', [notificationId]);
}

// 바뀐 행 수 (이미 읽은 알림은 세지 않는다)
async function markAllRead(memberId) {
  const [result] = await pool.query('UPDATE notification SET is_read = TRUE WHERE member_id = ? AND is_read = FALSE', [
    memberId,
  ]);
  return result.affectedRows;
}

// 알림 여러 건을 한 번에 저장하고, 저장된 행을 그대로 돌려준다 (실시간 전송용).
async function insertNotifications(items) {
  if (items.length === 0) {
    return [];
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ids = [];
    for (const { memberId, type, message, questionId } of items) {
      const [result] = await conn.query(
        'INSERT INTO notification (member_id, type, message, question_id) VALUES (?, ?, ?, ?)',
        [memberId, type, message, questionId],
      );
      ids.push(result.insertId);
    }
    const [rows] = await conn.query(
      `SELECT member_id AS memberId, ${NOTIFICATION_COLUMNS} FROM notification WHERE notification_id IN (?)`,
      [ids],
    );
    await conn.commit();
    return rows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 질문 알림에 필요한 정보: 제목, 작성자, 카테고리 이름
async function findQuestionForNotification(questionId) {
  const [rows] = await pool.query(
    `SELECT q.question_id AS questionId, q.title, q.member_id AS writerId, q.category_id AS categoryId,
            c.name AS categoryName
       FROM question q
       JOIN category c ON c.category_id = q.category_id
      WHERE q.question_id = ?`,
    [questionId],
  );
  return rows[0] ?? null;
}

async function findAnswerWriterId(answerId) {
  const [rows] = await pool.query('SELECT member_id AS memberId FROM answer WHERE answer_id = ?', [answerId]);
  return rows[0]?.memberId ?? null;
}

// 그 카테고리를 관심 카테고리로 두고 알림을 켠 활동 회원 (작성자 본인 제외)
async function findCategorySubscribers(categoryId, excludeMemberId) {
  const [rows] = await pool.query(
    `SELECT m.member_id AS memberId
       FROM member_category mc
       JOIN member m ON m.member_id = mc.member_id
      WHERE mc.category_id = ?
        AND m.notification_enabled = TRUE
        AND m.status = ?
        AND m.member_id <> ?`,
    [categoryId, MEMBER_STATUS.ACTIVE, excludeMemberId],
  );
  return rows.map((row) => row.memberId);
}

module.exports = {
  findNotifications,
  countNotifications,
  countUnread,
  findNotificationOwner,
  markRead,
  markAllRead,
  insertNotifications,
  findQuestionForNotification,
  findAnswerWriterId,
  findCategorySubscribers,
};
