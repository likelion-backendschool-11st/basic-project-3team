const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { MEMBER_STATUS } = require('../utils/constants');
const { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN_MS } = require('./auth.constants');

// 아이디가 없을 때도 bcrypt.compare를 한 번 실행해 응답 시간으로 아이디 존재 여부가 드러나지 않게 한다.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// docs/auth.md: 정지·탈퇴 회원은 로그인·토큰 재발급이 불가하다.
function assertCanSignIn(member) {
  if (member.status === MEMBER_STATUS.BANNED) {
    throw new AppError(ErrorCode.MEMBER_BANNED);
  }
  if (member.status === MEMBER_STATUS.WITHDRAWN) {
    throw new AppError(ErrorCode.MEMBER_WITHDRAWN);
  }
}

function createAccessToken({ memberId, role }) {
  // Payload에는 memberId, role만 넣는다 (개인정보 제외).
  return jwt.sign({ memberId, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function createRefreshToken(memberId) {
  // jti로 같은 초에 발급해도 토큰 값이 달라지게 한다 (rotation 시 이전 토큰과 구분).
  const refreshToken = jwt.sign({ memberId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: Math.floor(REFRESH_TOKEN_EXPIRES_IN_MS / 1000),
    jwtid: crypto.randomUUID(),
  });
  return {
    refreshToken,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
  };
}

function toLoginResult(member, accessToken, refreshToken) {
  return {
    body: { accessToken, memberId: member.memberId, nickname: member.nickname, role: member.role },
    refreshToken,
  };
}

async function login({ loginId, password }) {
  const member = await authRepository.findMemberByLoginId(loginId);
  const matched = await bcrypt.compare(password, member?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!member || !matched) {
    throw new AppError(ErrorCode.LOGIN_FAILED);
  }
  assertCanSignIn(member);

  const accessToken = createAccessToken(member);
  const { refreshToken, tokenHash, expiresAt } = createRefreshToken(member.memberId);
  await authRepository.saveRefreshToken({ memberId: member.memberId, tokenHash, expiresAt });
  return toLoginResult(member, accessToken, refreshToken);
}

function verifyRefreshToken(token) {
  if (!token) {
    throw new AppError(ErrorCode.INVALID_REFRESH_TOKEN);
  }
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError(ErrorCode.INVALID_REFRESH_TOKEN);
  }
}

async function reissue(oldRefreshToken) {
  const { memberId } = verifyRefreshToken(oldRefreshToken);
  const oldTokenHash = hashToken(oldRefreshToken);

  // DB에 저장된 최신 토큰과 다르면 이미 교체된(또는 로그아웃된) 토큰이다.
  const saved = await authRepository.findRefreshToken(memberId);
  if (!saved || saved.tokenHash !== oldTokenHash || saved.expiresAt <= new Date()) {
    throw new AppError(ErrorCode.INVALID_REFRESH_TOKEN);
  }

  const member = await authRepository.findMemberById(memberId);
  if (!member) {
    await authRepository.deleteRefreshToken(memberId);
    throw new AppError(ErrorCode.INVALID_REFRESH_TOKEN);
  }
  try {
    assertCanSignIn(member);
  } catch (err) {
    await authRepository.deleteRefreshToken(memberId);
    throw err;
  }

  const accessToken = createAccessToken(member);
  const { refreshToken, tokenHash, expiresAt } = createRefreshToken(memberId);
  const rotated = await authRepository.rotateRefreshToken({ memberId, oldTokenHash, tokenHash, expiresAt });
  if (!rotated) {
    throw new AppError(ErrorCode.INVALID_REFRESH_TOKEN);
  }
  return toLoginResult(member, accessToken, refreshToken);
}

async function logout(memberId) {
  await authRepository.deleteRefreshToken(memberId);
}

module.exports = { login, reissue, logout };
