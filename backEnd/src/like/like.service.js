const likeRepository = require('./like.repository');
const { findWritableMember } = require('../member/mypage.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { withTransaction } = require('../utils/transaction');

// 대상을 잠그고 존재·본인 글 여부를 확인한 뒤 change(conn)를 실행하고, 바뀐 좋아요 수를 돌려준다.
async function changeLike(memberId, target, targetId, change) {
  await findWritableMember(memberId);
  return withTransaction(async (conn) => {
    const found = await likeRepository.findTargetForUpdate(conn, target, targetId);
    if (found === null) {
      throw new AppError(target.notFound);
    }
    if (found.memberId === memberId) {
      throw new AppError(ErrorCode.CANNOT_LIKE_OWN_POST);
    }
    await change(conn);
    return likeRepository.findLikeCount(conn, target, targetId);
  });
}

// 좋아요 (#65, REQ-QUESTION-010, REQ-ANSWER-007). 1인 1회, 본인 글 불가. 좋아요 행과 like_count를 한 트랜잭션에서 바꾼다.
async function like(memberId, target, targetId) {
  const likeCount = await changeLike(memberId, target, targetId, async (conn) => {
    try {
      await likeRepository.insertLike(conn, target, memberId, targetId);
    } catch (err) {
      throw err.code === 'ER_DUP_ENTRY' ? new AppError(ErrorCode.ALREADY_LIKED) : err;
    }
    await likeRepository.changeLikeCount(conn, target, targetId, 1);
  });
  return { liked: true, likeCount };
}

// 좋아요 취소. 좋아요하지 않은 대상이면 404 LIKE_NOT_FOUND
async function unlike(memberId, target, targetId) {
  const likeCount = await changeLike(memberId, target, targetId, async (conn) => {
    if (!(await likeRepository.deleteLike(conn, target, memberId, targetId))) {
      throw new AppError(ErrorCode.LIKE_NOT_FOUND);
    }
    await likeRepository.changeLikeCount(conn, target, targetId, -1);
  });
  return { liked: false, likeCount };
}

module.exports = { like, unlike };
