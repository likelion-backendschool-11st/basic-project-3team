const adminMemberRepository = require('./adminMember.repository');
const { deleteRefreshToken } = require('../auth/auth.repository');
const { findWritableMember } = require('../member/mypage.service');
const { MEMBER_STATUS, ROLE } = require('../utils/constants');
const { getOffset, toPage } = require('../utils/page');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { withTransaction } = require('../utils/transaction');

function toMemberItem(row) {
  return {
    memberId: row.memberId,
    loginId: row.loginId,
    nickname: row.nickname,
    role: row.role,
    status: row.status,
    reportedCount: Number(row.reportedCount),
    createdAt: row.createdAt,
  };
}

// 회원 목록 (REQ-MANAGE-001). 최근 가입순.
async function getMembers({ page, size, status, keyword }) {
  const condition = { status, keyword };
  const [rows, totalElements] = await Promise.all([
    adminMemberRepository.findMembers(condition, { limit: size, offset: getOffset(page, size) }),
    adminMemberRepository.countMembers(condition),
  ]);
  return toPage(rows.map(toMemberItem), page, size, Number(totalElements));
}

// 회원 정지·해제 (REQ-ADMIN-003). 정지하면 Refresh Token을 지워 재발급을 막는다 (docs/auth.md 회원 상태).
// 남은 Access Token으로 하는 쓰기 요청은 각 Service의 findWritableMember가 403 MEMBER_BANNED로 막는다.
async function changeMemberStatus(adminId, memberId, status) {
  await findWritableMember(adminId);

  return withTransaction(async (conn) => {
    const member = await adminMemberRepository.findMemberForUpdate(conn, memberId);
    if (member === null) {
      throw new AppError(ErrorCode.MEMBER_NOT_FOUND);
    }
    // 관리자 계정(자기 자신 포함)은 정지할 수 없다.
    if (member.role === ROLE.ADMIN) {
      throw new AppError(ErrorCode.FORBIDDEN);
    }
    // 탈퇴한 회원은 다시 활성화하거나 정지하지 않는다.
    if (member.status === MEMBER_STATUS.WITHDRAWN) {
      throw new AppError(ErrorCode.MEMBER_WITHDRAWN);
    }

    if (member.status !== status) {
      await adminMemberRepository.updateMemberStatus(conn, memberId, status);
    }
    if (status === MEMBER_STATUS.BANNED) {
      await deleteRefreshToken(memberId, conn);
    }
    return { memberId, status };
  });
}

module.exports = { getMembers, changeMemberStatus };
