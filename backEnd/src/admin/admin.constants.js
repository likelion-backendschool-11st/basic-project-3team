// 관리자 신고 처리 (docs/api.md 11장). 값은 schema.sql report 테이블의 CHECK 제약과 같게 유지한다.
const { MEMBER_STATUS } = require('../utils/constants');

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

// 회원 관리 (docs/api.md 11장). 관리자는 ACTIVE ↔ BANNED만 바꾼다 (WITHDRAWN은 탈퇴로만).
const CHANGEABLE_MEMBER_STATUS = Object.freeze([MEMBER_STATUS.ACTIVE, MEMBER_STATUS.BANNED]);
// 회원 검색어 최대 길이. 아이디(12자)·닉네임(10자)보다 넉넉하게 둔다.
const MEMBER_KEYWORD_MAX = 20;

module.exports = {
  REPORT_STATUS,
  REPORT_ACTION,
  ACTION_RESULT_STATUS,
  REPORT_SORT,
  CHANGEABLE_MEMBER_STATUS,
  MEMBER_KEYWORD_MAX,
};
