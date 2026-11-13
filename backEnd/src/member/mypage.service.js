const bcrypt = require('bcrypt');
const pool = require('../config/db');
const mypageRepository = require('./mypage.repository');
const authService = require('../auth/auth.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { toPage } = require('../utils/page');
const { BCRYPT_SALT_ROUNDS } = require('./member.constants');
const { MEMBER_STATUS, GRADES, BADGES } = require('./mypage.constants');

// UNIQUE 키 이름 → 에러 코드 (backEnd/db/schema.sql의 member 테이블)
const DUPLICATE_KEY_ERRORS = Object.freeze({
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

async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await work(conn);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw toDuplicateError(err) ?? err;
  } finally {
    conn.release();
  }
}

// 내 정보 조회용. 탈퇴 회원의 남은 Access Token(최대 30분)으로는 조회하지 못하게 한다.
async function findMyMember(memberId) {
  const member = await mypageRepository.findMemberById(memberId);
  if (member === null) {
    throw new AppError(ErrorCode.MEMBER_NOT_FOUND);
  }
  if (member.status === MEMBER_STATUS.WITHDRAWN) {
    throw new AppError(ErrorCode.MEMBER_WITHDRAWN);
  }
  return member;
}

// 쓰기 작업은 정지 회원도 막는다 (docs/auth.md 회원 상태).
async function findWritableMember(memberId) {
  const member = await findMyMember(memberId);
  if (member.status === MEMBER_STATUS.BANNED) {
    throw new AppError(ErrorCode.MEMBER_BANNED);
  }
  return member;
}

// 채택된 답변 수 ÷ 전체 답변 수 × 100, 소수점 첫째 자리. 답변이 없으면 0 (REQ-MYPAGE-006)
function toAcceptRate({ answerCount, acceptedCount }) {
  return answerCount === 0 ? 0 : Math.round((acceptedCount / answerCount) * 1000) / 10;
}

function findGradeIndex(acceptedCount) {
  return GRADES.findLastIndex(({ minAccepted }) => acceptedCount >= minAccepted);
}

async function buildProfile(member) {
  const [techStacks, stats] = await Promise.all([
    mypageRepository.findTechStackNames(member.memberId),
    mypageRepository.findActivityStats(member.memberId),
  ]);
  return {
    memberId: member.memberId,
    nickname: member.nickname,
    bio: member.bio,
    careerYears: member.careerYears,
    techStacks,
    grade: GRADES[findGradeIndex(stats.acceptedCount)].grade,
    acceptRate: toAcceptRate(stats),
  };
}

// 다른 회원도 볼 수 있는 공개 프로필. 탈퇴한 회원은 없는 회원으로 본다.
async function getProfile(memberId) {
  const member = await mypageRepository.findMemberById(memberId);
  if (member === null || member.status === MEMBER_STATUS.WITHDRAWN) {
    throw new AppError(ErrorCode.MEMBER_NOT_FOUND);
  }
  return buildProfile(member);
}

async function getMe(memberId) {
  const member = await findMyMember(memberId);
  const profile = await buildProfile(member);
  return { ...profile, loginId: member.loginId, phone: member.phone, role: member.role, createdAt: member.createdAt };
}

// input에는 요청에 들어 있던 필드만 있다. techStacks는 소문자·중복 제거된 이름 목록.
async function updateProfile(memberId, input) {
  await findWritableMember(memberId);

  if (input.nickname !== undefined && (await mypageRepository.existsNicknameOfOthers(input.nickname, memberId))) {
    throw new AppError(ErrorCode.DUPLICATE_NICKNAME);
  }

  let tagIds = null;
  if (input.techStacks !== undefined) {
    tagIds = await mypageRepository.findTagIdsByNames(input.techStacks);
    if (tagIds.length !== input.techStacks.length) {
      throw new AppError(ErrorCode.INVALID_INPUT, {
        errors: [{ field: 'techStacks', reason: '태그 목록에 없는 기술 스택이 있습니다.' }],
      });
    }
  }

  await withTransaction(async (conn) => {
    await mypageRepository.updateProfile(conn, memberId, input);
    if (tagIds !== null) {
      await mypageRepository.replaceTechStacks(conn, memberId, tagIds);
    }
  });
}

async function updatePrivate(memberId, { currentPassword, newPassword, phone }) {
  await findWritableMember(memberId);

  const passwordHash = await mypageRepository.findPasswordHash(memberId);
  if (!(await bcrypt.compare(currentPassword, passwordHash))) {
    throw new AppError(ErrorCode.PASSWORD_MISMATCH);
  }
  if (phone !== undefined && (await mypageRepository.existsPhoneOfOthers(phone, memberId))) {
    throw new AppError(ErrorCode.DUPLICATE_PHONE);
  }

  const newPasswordHash = newPassword === undefined ? null : await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  let refreshToken = null;
  await withTransaction(async (conn) => {
    if (newPasswordHash !== null) {
      await mypageRepository.updatePasswordHash(conn, memberId, newPasswordHash);
      // 비밀번호를 바꾸면 다른 기기의 로그인을 끊는다 (REQ-FIND-005와 같은 취지).
      // 회원당 1개인 Refresh Token을 새로 발급해 교체하므로 지금 기기는 로그인이 유지된다.
      refreshToken = await authService.issueRefreshToken(memberId, conn);
    }
    if (phone !== undefined) {
      await mypageRepository.updatePhone(conn, memberId, phone);
    }
  });
  return { refreshToken };
}

async function getCategories(memberId) {
  const member = await findMyMember(memberId);
  const categoryIds = await mypageRepository.findCategoryIds(memberId);
  return { categoryIds, notificationEnabled: Boolean(member.notificationEnabled) };
}

// 목록 전체를 교체한다. categoryIds는 중복 제거된 목록.
async function updateCategories(memberId, { categoryIds, notificationEnabled }) {
  await findWritableMember(memberId);

  if ((await mypageRepository.countCategoriesByIds(categoryIds)) !== categoryIds.length) {
    throw new AppError(ErrorCode.CATEGORY_NOT_FOUND);
  }

  await withTransaction(async (conn) => {
    await mypageRepository.replaceCategories(conn, memberId, categoryIds);
    await mypageRepository.updateNotificationEnabled(conn, memberId, notificationEnabled);
  });
}

// 등급·뱃지는 저장하지 않고 활동 수로 계산한다 (docs/api.md 3장 내 등급·뱃지 조회).
// 진행도 게이지용으로 등급은 acceptedCount / nextGradeMin, 뱃지는 current / target을 함께 내려준다.
async function getGrade(memberId) {
  await findMyMember(memberId);
  const stats = await mypageRepository.findActivityStats(memberId);

  const gradeIndex = findGradeIndex(stats.acceptedCount);
  const next = GRADES[gradeIndex + 1] ?? null;

  return {
    grade: GRADES[gradeIndex].grade,
    nextGrade: next?.grade ?? null,
    nextGradeCondition: next ? `채택된 답변 ${next.minAccepted}개 (현재 ${stats.acceptedCount}개)` : null,
    acceptedCount: stats.acceptedCount,
    nextGradeMin: next?.minAccepted ?? null,
    badges: BADGES.map(({ code, name, condition, stat, min }) => ({
      code,
      name,
      condition,
      acquired: stats[stat] >= min,
      current: stats[stat],
      target: min,
    })),
  };
}

async function getAcceptedAnswers(memberId, { page, size }) {
  await findMyMember(memberId);
  const paging = { limit: size, offset: page * size };
  const [content, total] = await Promise.all([
    mypageRepository.findAcceptedAnswers(memberId, paging),
    mypageRepository.countAcceptedAnswers(memberId),
  ]);
  return toPage(content, page, size, total);
}

async function getMyQuestions(memberId, { page, size }) {
  await findMyMember(memberId);
  const paging = { limit: size, offset: page * size };
  const [rows, total] = await Promise.all([
    mypageRepository.findQuestionsByMember(memberId, paging),
    mypageRepository.countQuestionsByMember(memberId),
  ]);
  const content = rows.map((row) => ({ ...row, accepted: Boolean(row.accepted) }));
  return toPage(content, page, size, total);
}

async function getMyAnswers(memberId, { page, size }) {
  await findMyMember(memberId);
  const paging = { limit: size, offset: page * size };
  const [rows, total] = await Promise.all([
    mypageRepository.findAnswersByMember(memberId, paging),
    mypageRepository.countAnswersByMember(memberId),
  ]);
  const content = rows.map((row) => ({ ...row, accepted: Boolean(row.accepted) }));
  return toPage(content, page, size, total);
}

module.exports = {
  findWritableMember,
  buildProfile,
  getProfile,
  getMe,
  updateProfile,
  updatePrivate,
  getCategories,
  updateCategories,
  getGrade,
  getAcceptedAnswers,
  getMyQuestions,
  getMyAnswers,
};
