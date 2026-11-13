// 관리자 신고 처리 (docs/api.md 11장). 값은 schema.sql report 테이블의 CHECK 제약과 같게 유지한다.
const REPORT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
});

const REPORT_ACTION = Object.freeze({
  DELETE_TARGET: 'DELETE_TARGET',
  REJECT: 'REJECT',
});

// 처리 방식 → 처리 후 신고 상태
const ACTION_RESULT_STATUS = Object.freeze({
  [REPORT_ACTION.DELETE_TARGET]: REPORT_STATUS.RESOLVED,
  [REPORT_ACTION.REJECT]: REPORT_STATUS.REJECTED,
});

// 신고 목록 정렬. 값이 바뀌면 admin.repository.js의 REPORT_ORDER_BY도 함께 고친다.
const REPORT_SORT = Object.freeze({
  LATEST: 'latest',
  OLDEST: 'oldest',
  REPORTS: 'reports',
});

module.exports = { REPORT_STATUS, REPORT_ACTION, ACTION_RESULT_STATUS, REPORT_SORT };
