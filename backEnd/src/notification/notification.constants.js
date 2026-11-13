// 알림 (docs/api.md 9장). 값은 schema.sql notification 테이블의 CHECK 제약과 같게 유지한다.
const NOTIFICATION_TYPE = Object.freeze({
  ANSWER_CREATED: 'ANSWER_CREATED',
  ANSWER_ACCEPTED: 'ANSWER_ACCEPTED',
  CATEGORY_QUESTION: 'CATEGORY_QUESTION',
});

// socket.io: 회원별 방 이름과 서버 → 클라이언트 이벤트 이름
const memberRoom = (memberId) => `member:${memberId}`;
const NOTIFICATION_EVENT = 'notification';

module.exports = { NOTIFICATION_TYPE, memberRoom, NOTIFICATION_EVENT };
