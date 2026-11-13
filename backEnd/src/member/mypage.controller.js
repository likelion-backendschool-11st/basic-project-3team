const mypageService = require('./mypage.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../utils/constants');
const { PASSWORD_PATTERN, PHONE_PATTERN, NICKNAME_PATTERN } = require('./member.constants');
const { BIO_MAX_LENGTH, CAREER_YEARS_MAX, TECH_STACK_MAX } = require('./mypage.constants');

const DIGITS = /^\d+$/;

const REASONS = Object.freeze({
  memberId: 'memberId는 1 이상의 정수여야 합니다.',
  nickname: '닉네임은 2~10자의 한글, 영문, 숫자만 사용할 수 있습니다.',
  bio: `소개글은 ${BIO_MAX_LENGTH}자 이하로 입력해주세요.`,
  careerYears: `경력은 0~${CAREER_YEARS_MAX} 사이의 정수로 입력해주세요.`,
  techStacks: `기술 스택은 최대 ${TECH_STACK_MAX}개까지 선택할 수 있습니다.`,
  currentPassword: '현재 비밀번호를 입력해주세요.',
  newPassword: '비밀번호는 8~12자의 영문, 숫자, 특수기호(_ . -)만 사용할 수 있습니다.',
  phone: '전화번호는 01로 시작하는 하이픈 없는 숫자 10~11자리여야 합니다.',
  categoryIds: '관심 카테고리는 카테고리 ID 목록으로 보내주세요.',
  notificationEnabled: 'notificationEnabled는 true 또는 false여야 합니다.',
  page: 'page는 0 이상의 정수여야 합니다.',
  size: `size는 1~${MAX_PAGE_SIZE} 사이의 정수여야 합니다.`,
});

function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, { errors });
  }
}

function toBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body) ? body : {};
}

function isPositiveId(value) {
  return Number.isSafeInteger(value) && value >= 1;
}

function matches(pattern, value) {
  return typeof value === 'string' && pattern.test(value);
}

// 값이 없으면 기본값, 범위 안의 0 이상 정수 문자열이 아니면 null
function parseIntParam(value, defaultValue, min, max) {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  if (typeof value !== 'string' || !DIGITS.test(value)) {
    return null;
  }
  const number = Number(value);
  return number >= min && number <= max ? number : null;
}

function parsePaging(query) {
  const page = parseIntParam(query.page, DEFAULT_PAGE, 0, Number.MAX_SAFE_INTEGER);
  const size = parseIntParam(query.size, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const errors = [];
  if (page === null) {
    errors.push({ field: 'page', reason: REASONS.page });
  }
  if (size === null) {
    errors.push({ field: 'size', reason: REASONS.size });
  }
  throwIfErrors(errors);
  return { page, size };
}

function parseMemberId(value) {
  const memberId = typeof value === 'string' && DIGITS.test(value) ? Number(value) : null;
  if (!isPositiveId(memberId)) {
    throwIfErrors([{ field: 'memberId', reason: REASONS.memberId }]);
  }
  return memberId;
}

// 보낸 필드만 검사해서 담는다. bio·careerYears는 null로 지울 수 있고, techStacks는 null이면 빈 목록이다.
function parseProfileBody(body) {
  const input = {};
  const errors = [];

  if (body.nickname !== undefined) {
    if (matches(NICKNAME_PATTERN, body.nickname)) {
      input.nickname = body.nickname;
    } else {
      errors.push({ field: 'nickname', reason: REASONS.nickname });
    }
  }

  if (body.bio !== undefined) {
    if (body.bio === null || body.bio === '') {
      input.bio = null;
    } else if (typeof body.bio === 'string' && body.bio.length <= BIO_MAX_LENGTH) {
      input.bio = body.bio;
    } else {
      errors.push({ field: 'bio', reason: REASONS.bio });
    }
  }

  if (body.careerYears !== undefined) {
    const { careerYears } = body;
    const inRange = Number.isInteger(careerYears) && careerYears >= 0 && careerYears <= CAREER_YEARS_MAX;
    if (careerYears === null || inRange) {
      input.careerYears = careerYears;
    } else {
      errors.push({ field: 'careerYears', reason: REASONS.careerYears });
    }
  }

  if (body.techStacks !== undefined) {
    const list = body.techStacks ?? [];
    const valid = Array.isArray(list) && list.every((name) => typeof name === 'string' && name.trim() !== '');
    const names = valid ? [...new Set(list.map((name) => name.trim().toLowerCase()))] : null;
    if (names !== null && names.length <= TECH_STACK_MAX) {
      input.techStacks = names;
    } else {
      errors.push({ field: 'techStacks', reason: REASONS.techStacks });
    }
  }

  throwIfErrors(errors);
  return input;
}

// currentPassword는 필수, newPassword·phone은 보낸 것만 바꾼다.
function parsePrivateBody(body) {
  const input = {};
  const errors = [];

  if (typeof body.currentPassword === 'string' && body.currentPassword !== '') {
    input.currentPassword = body.currentPassword;
  } else {
    errors.push({ field: 'currentPassword', reason: REASONS.currentPassword });
  }

  if (body.newPassword !== undefined) {
    if (matches(PASSWORD_PATTERN, body.newPassword)) {
      input.newPassword = body.newPassword;
    } else {
      errors.push({ field: 'newPassword', reason: REASONS.newPassword });
    }
  }

  if (body.phone !== undefined) {
    if (matches(PHONE_PATTERN, body.phone)) {
      input.phone = body.phone;
    } else {
      errors.push({ field: 'phone', reason: REASONS.phone });
    }
  }

  throwIfErrors(errors);
  return input;
}

function parseCategoriesBody(body) {
  const errors = [];
  const { categoryIds, notificationEnabled } = body;

  const validIds = Array.isArray(categoryIds) && categoryIds.every(isPositiveId);
  if (!validIds) {
    errors.push({ field: 'categoryIds', reason: REASONS.categoryIds });
  }
  if (typeof notificationEnabled !== 'boolean') {
    errors.push({ field: 'notificationEnabled', reason: REASONS.notificationEnabled });
  }

  throwIfErrors(errors);
  return { categoryIds: [...new Set(categoryIds)], notificationEnabled };
}

async function getProfile(req, res, next) {
  try {
    return success(res, await mypageService.getProfile(parseMemberId(req.params.memberId)));
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    return success(res, await mypageService.getMe(req.user.memberId));
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    await mypageService.updateProfile(req.user.memberId, parseProfileBody(toBody(req.body)));
    return success(res);
  } catch (err) {
    return next(err);
  }
}

async function updatePrivate(req, res, next) {
  try {
    await mypageService.updatePrivate(req.user.memberId, parsePrivateBody(toBody(req.body)));
    return success(res);
  } catch (err) {
    return next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    return success(res, await mypageService.getCategories(req.user.memberId));
  } catch (err) {
    return next(err);
  }
}

async function updateCategories(req, res, next) {
  try {
    await mypageService.updateCategories(req.user.memberId, parseCategoriesBody(toBody(req.body)));
    return success(res);
  } catch (err) {
    return next(err);
  }
}

async function getGrade(req, res, next) {
  try {
    return success(res, await mypageService.getGrade(req.user.memberId));
  } catch (err) {
    return next(err);
  }
}

async function getAcceptedAnswers(req, res, next) {
  try {
    return success(res, await mypageService.getAcceptedAnswers(req.user.memberId, parsePaging(req.query)));
  } catch (err) {
    return next(err);
  }
}

async function getMyQuestions(req, res, next) {
  try {
    return success(res, await mypageService.getMyQuestions(req.user.memberId, parsePaging(req.query)));
  } catch (err) {
    return next(err);
  }
}

async function getMyAnswers(req, res, next) {
  try {
    return success(res, await mypageService.getMyAnswers(req.user.memberId, parsePaging(req.query)));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
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
