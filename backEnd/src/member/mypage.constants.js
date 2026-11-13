// 마이페이지 입력값 규칙 (docs/api.md 1장 입력값 규칙). 아이디·비밀번호·전화번호·닉네임 패턴은 member.constants.js를 쓴다.
const BIO_MAX_LENGTH = 200;
const CAREER_YEARS_MAX = 50;
const TECH_STACK_MAX = 5;

// 회원 상태 (docs/04-db.md member.status)
const MEMBER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  WITHDRAWN: 'WITHDRAWN',
});

// 등급 — 채택된 답변 수 기준, 낮은 등급부터 (docs/api.md 3장 내 등급·뱃지 조회)
const GRADES = Object.freeze([
  { grade: 'BRONZE', minAccepted: 0 },
  { grade: 'SILVER', minAccepted: 5 },
  { grade: 'GOLD', minAccepted: 20 },
  { grade: 'PLATINUM', minAccepted: 50 },
]);

// 좋아요를 이만큼 받은 답변이 있으면 POPULAR_ANSWER 뱃지
const POPULAR_ANSWER_LIKE_COUNT = 10;

// 뱃지 — stat은 활동 통계(findActivityStats)의 키, 그 값이 min 이상이면 획득
const BADGES = Object.freeze([
  { code: 'FIRST_QUESTION', name: '첫 질문', condition: '질문 1개 작성', stat: 'questionCount', min: 1 },
  { code: 'FIRST_ANSWER', name: '첫 답변', condition: '답변 1개 작성', stat: 'answerCount', min: 1 },
  { code: 'FIRST_ACCEPTED', name: '첫 채택', condition: '채택된 답변 1개', stat: 'acceptedCount', min: 1 },
  { code: 'CURIOUS', name: '질문왕', condition: '질문 10개 작성', stat: 'questionCount', min: 10 },
  { code: 'SOLVER', name: '해결사', condition: '채택된 답변 10개', stat: 'acceptedCount', min: 10 },
  {
    code: 'POPULAR_ANSWER',
    name: '인기 답변',
    condition: `좋아요 ${POPULAR_ANSWER_LIKE_COUNT}개 이상 받은 답변 1개`,
    stat: 'popularAnswerCount',
    min: 1,
  },
]);

module.exports = {
  BIO_MAX_LENGTH,
  CAREER_YEARS_MAX,
  TECH_STACK_MAX,
  MEMBER_STATUS,
  GRADES,
  POPULAR_ANSWER_LIKE_COUNT,
  BADGES,
};
