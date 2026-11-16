const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const memberRepository = require('./member.repository');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { ROLE, MEMBER_STATUS } = require('../utils/constants');
const { BCRYPT_SALT_ROUNDS, WITHDRAWN_PREFIX } = require('./member.constants');

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

function assertWithdrawable(member) {
  if (member === null) {
    throw new AppError(ErrorCode.MEMBER_NOT_FOUND);
  }
  if (member.status === MEMBER_STATUS.WITHDRAWN) {
    throw new AppError(ErrorCode.MEMBER_WITHDRAWN);
  }
  // 정지 회원이 탈퇴 후 같은 전화번호로 다시 가입해 정지를 피하지 못하게 한다.
  if (member.status === MEMBER_STATUS.BANNED) {
    throw new AppError(ErrorCode.MEMBER_BANNED);
  }
  // 관리자 계정이 없어지면 신고 처리·회원 정지를 할 수 없으므로 탈퇴를 막는다.
  if (member.role === ROLE.ADMIN) {
    throw new AppError(ErrorCode.FORBIDDEN);
  }
}

// 회원 탈퇴 (#68): 비밀번호를 다시 확인하고 개인정보를 익명화한다. 되돌릴 수 없다.
async function withdraw(memberId, password) {
  // 로그인할 수 없는 값으로 덮어써 원래 비밀번호 해시를 남기지 않는다.
  const unusablePasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_SALT_ROUNDS);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const member = await memberRepository.findMemberForUpdate(conn, memberId);
    assertWithdrawable(member);
    if (!(await bcrypt.compare(password, member.passwordHash))) {
      throw new AppError(ErrorCode.PASSWORD_MISMATCH);
    }

    await memberRepository.anonymizeMember(conn, memberId, {
      loginId: `${WITHDRAWN_PREFIX.loginId}${memberId}`,
      phone: `${WITHDRAWN_PREFIX.phone}${memberId}`,
      nickname: `${WITHDRAWN_PREFIX.nickname}${memberId}`,
      passwordHash: unusablePasswordHash,
      status: MEMBER_STATUS.WITHDRAWN,
    });
    await memberRepository.deletePersonalData(conn, memberId);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { checkLoginId, checkPhone, checkNickname, signup, withdraw };
