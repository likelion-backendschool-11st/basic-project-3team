const bcrypt = require('bcrypt');
const memberRepository = require('./member.repository');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { BCRYPT_SALT_ROUNDS } = require('./member.constants');

// UNIQUE 키 이름 → 에러 코드 (backEnd/db/schema.sql의 member 테이블)
const DUPLICATE_KEY_ERRORS = Object.freeze({
  uk_member_login_id: ErrorCode.DUPLICATE_LOGIN_ID,
  uk_member_phone: ErrorCode.DUPLICATE_PHONE,
  uk_member_nickname: ErrorCode.DUPLICATE_NICKNAME,
});

function toDuplicateError(err) {
  if (err.code !== 'ER_DUP_ENTRY') {
    return null;
  }
  const key = Object.keys(DUPLICATE_KEY_ERRORS).find((name) => err.sqlMessage?.includes(name));
  return key ? new AppError(DUPLICATE_KEY_ERRORS[key]) : null;
}

async function checkLoginId(loginId) {
  return { available: !(await memberRepository.existsByLoginId(loginId)) };
}

async function checkPhone(phone) {
  return { available: !(await memberRepository.existsByPhone(phone)) };
}

async function checkNickname(nickname) {
  return { available: !(await memberRepository.existsByNickname(nickname)) };
}

// 중복 확인을 거친 값이어도 가입 시 다시 확인한다 (docs/api.md 3장 회원가입).
async function signup({ loginId, password, nickname, phone }) {
  if (await memberRepository.existsByLoginId(loginId)) {
    throw new AppError(ErrorCode.DUPLICATE_LOGIN_ID);
  }
  if (await memberRepository.existsByPhone(phone)) {
    throw new AppError(ErrorCode.DUPLICATE_PHONE);
  }
  if (await memberRepository.existsByNickname(nickname)) {
    throw new AppError(ErrorCode.DUPLICATE_NICKNAME);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  try {
    const memberId = await memberRepository.insertMember({ loginId, passwordHash, phone, nickname });
    return { memberId };
  } catch (err) {
    // 확인과 INSERT 사이에 같은 값으로 먼저 가입한 경우
    throw toDuplicateError(err) ?? err;
  }
}

module.exports = { checkLoginId, checkPhone, checkNickname, signup };
