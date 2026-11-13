// 신고 (docs/api.md 8장). 값은 schema.sql report 테이블의 CHECK 제약과 같게 유지한다.
const REPORT_TARGET_TYPE = Object.freeze({
  QUESTION: 'QUESTION',
  ANSWER: 'ANSWER',
});

const REPORT_REASON = Object.freeze({
  SPAM: 'SPAM',
  ABUSE: 'ABUSE',
  OBSCENE: 'OBSCENE',
  PRIVACY: 'PRIVACY',
  OFF_TOPIC: 'OFF_TOPIC',
  COPYRIGHT: 'COPYRIGHT',
  ETC: 'ETC',
});

const REASON_DETAIL_MAX = 200;

module.exports = { REPORT_TARGET_TYPE, REPORT_REASON, REASON_DETAIL_MAX };
