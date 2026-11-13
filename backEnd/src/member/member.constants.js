// 회원 입력값 규칙 (docs/api.md 1장 입력값 규칙)
const LOGIN_ID_PATTERN = /^[A-Za-z0-9_.-]{8,12}$/;
const PASSWORD_PATTERN = /^[A-Za-z0-9_.-]{8,12}$/;
const PHONE_PATTERN = /^01[0-9]{8,9}$/;
const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9]{2,10}$/;

const BCRYPT_SALT_ROUNDS = 10;

module.exports = { LOGIN_ID_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN, NICKNAME_PATTERN, BCRYPT_SALT_ROUNDS };
