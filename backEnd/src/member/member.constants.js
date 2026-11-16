// 회원 입력값 규칙 (docs/api.md 1장 입력값 규칙)
const LOGIN_ID_PATTERN = /^[A-Za-z0-9_.-]{8,12}$/;
const PASSWORD_PATTERN = /^[A-Za-z0-9_.-]{8,12}$/;
const PHONE_PATTERN = /^01[0-9]{8,9}$/;
const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9]{2,10}$/;

const BCRYPT_SALT_ROUNDS = 10;

// 탈퇴 회원의 아이디·전화번호·닉네임을 바꿀 값 (#68). 뒤에 memberId를 붙인다.
// '#'과 'W'는 가입 규칙으로는 들어올 수 없는 문자라 실제 회원 값과 겹치지 않고, 같은 값으로 다시 가입할 수 있다.
// 컬럼 길이: login_id 12자, phone 11자, nickname 10자 → memberId 7자리(약 999만)까지 들어간다.
const WITHDRAWN_PREFIX = Object.freeze({ loginId: 'wd#', phone: 'W', nickname: '탈퇴#' });

module.exports = {
  LOGIN_ID_PATTERN,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
  NICKNAME_PATTERN,
  BCRYPT_SALT_ROUNDS,
  WITHDRAWN_PREFIX,
};
