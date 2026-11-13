const pool = require('../config/db');
const { REPORT_SORT, REPORT_STATUS } = require('./admin.constants');

// ORDER BY에는 플레이스홀더를 쓸 수 없으므로 허용 목록의 값만 넣는다.
const REPORT_ORDER_BY = Object.freeze({
  [REPORT_SORT.LATEST]: 'r.created_at DESC, r.report_id DESC',
  [REPORT_SORT.OLDEST]: 'r.created_at ASC, r.report_id ASC',
  [REPORT_SORT.REPORTS]: 'reportCount DESC, r.created_at DESC, r.report_id DESC',
});

// 신고 대상(질문·답변)과 작성자를 붙인다. 대상 내용은 삭제 여부와 관계없이 보여준다 (docs/04-db.md report).
// 답변이 대상이면 답변이 달린 질문(aq)의 제목을 쓴다.
const REPORT_FROM = `
       FROM report r
       JOIN member rp ON rp.member_id = r.reporter_id
       LEFT JOIN question tq ON r.target_type = 'QUESTION' AND tq.question_id = r.target_id
       LEFT JOIN answer ta ON r.target_type = 'ANSWER' AND ta.answer_id = r.target_id
       LEFT JOIN question aq ON aq.question_id = ta.question_id
       LEFT JOIN member tw ON tw.member_id = COALESCE(tq.member_id, ta.member_id)`;

const REPORT_COLUMNS = `
            r.report_id AS reportId,
            r.target_type AS targetType,
            r.target_id AS targetId,
            COALESCE(tq.question_id, aq.question_id) AS questionId,
            COALESCE(tq.title, aq.title) AS targetTitle,
            COALESCE(tq.deleted, ta.deleted) AS targetDeleted,
            rp.member_id AS reporterId,
            rp.nickname AS reporterNickname,
            tw.member_id AS targetWriterId,
            tw.nickname AS targetWriterNickname,
            r.reason,
            r.reason_detail AS reasonDetail,
            r.status,
            DATE_FORMAT(r.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt`;

function buildReportWhere({ targetType, status }) {
  const conditions = [];
  const params = [];
  if (targetType !== null) {
    conditions.push('r.target_type = ?');
    params.push(targetType);
  }
  if (status !== null) {
    conditions.push('r.status = ?');
    params.push(status);
  }
  return { where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

async function findReports(condition, { sort, limit, offset }) {
  const orderBy = REPORT_ORDER_BY[sort];
  if (!orderBy) {
    throw new Error(`허용되지 않은 정렬 값입니다: ${sort}`);
  }
  const { where, params } = buildReportWhere(condition);
  const [rows] = await pool.query(
    `SELECT ${REPORT_COLUMNS},
            (SELECT COUNT(*)
               FROM report r2
              WHERE r2.target_type = r.target_type AND r2.target_id = r.target_id) AS reportCount
     ${REPORT_FROM}
     ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows;
}

async function countReports(condition) {
  const { where, params } = buildReportWhere(condition);
  const [rows] = await pool.query(`SELECT COUNT(*) AS totalElements FROM report r ${where}`, params);
  return rows[0].totalElements;
}

async function findReportById(reportId) {
  const [rows] = await pool.query(
    `SELECT ${REPORT_COLUMNS},
            COALESCE(tq.content, ta.content) AS targetContent
     ${REPORT_FROM}
      WHERE r.report_id = ?`,
    [reportId],
  );
  return rows[0] ?? null;
}

// 처리 트랜잭션 안에서 신고 행을 잠가, 같은 신고를 두 관리자가 동시에 처리하지 못하게 한다.
async function findReportForUpdate(conn, reportId) {
  const [rows] = await conn.query(
    `SELECT report_id AS reportId, target_type AS targetType, target_id AS targetId, status
       FROM report
      WHERE report_id = ?
        FOR UPDATE`,
    [reportId],
  );
  return rows[0] ?? null;
}

// 대상의 삭제 여부. 행이 없으면 null
async function findQuestionDeletedForUpdate(conn, questionId) {
  const [rows] = await conn.query('SELECT deleted FROM question WHERE question_id = ? FOR UPDATE', [questionId]);
  return rows.length > 0 ? Boolean(rows[0].deleted) : null;
}

async function findAnswerDeletedForUpdate(conn, answerId) {
  const [rows] = await conn.query('SELECT deleted FROM answer WHERE answer_id = ? FOR UPDATE', [answerId]);
  return rows.length > 0 ? Boolean(rows[0].deleted) : null;
}

// 답변 숨김 처리: 딸린 답글도 함께 숨긴다 (docs/03-db-open-questions.md 삭제 정책).
// 채택된 답변이어도 question.accepted_answer_id는 그대로 둔다 (해결 표시 유지, 다시 채택 불가).
// 이미 삭제된 답글은 건드리지 않아 원래 삭제 시각을 유지한다.
async function softDeleteAnswerWithReplies(conn, answerId) {
  await conn.query('UPDATE reply SET deleted = TRUE, deleted_at = NOW() WHERE answer_id = ? AND deleted = FALSE', [
    answerId,
  ]);
  await conn.query('UPDATE answer SET deleted = TRUE, deleted_at = NOW() WHERE answer_id = ?', [answerId]);
}

// 같은 대상에 쌓인 처리 대기 신고를 한 번에 같은 상태로 바꾼다. 바뀐 신고 수를 돌려준다.
async function processPendingReports(conn, { targetType, targetId, status, adminId }) {
  const [result] = await conn.query(
    `UPDATE report
        SET status = ?, processed_by = ?, processed_at = NOW()
      WHERE target_type = ? AND target_id = ? AND status = ?`,
    [status, adminId, targetType, targetId, REPORT_STATUS.PENDING],
  );
  return result.affectedRows;
}

module.exports = {
  findReports,
  countReports,
  findReportById,
  findReportForUpdate,
  findQuestionDeletedForUpdate,
  findAnswerDeletedForUpdate,
  softDeleteAnswerWithReplies,
  processPendingReports,
};
