const likeService = require('./like.service');
const { success } = require('../utils/response');
const { parsePathId } = require('../utils/params');
const { LIKE_TARGETS } = require('./like.constants');

// 질문·답변 좋아요/취소 4개 API가 대상만 다르고 처리는 같아서 핸들러를 만들어 쓴다.
function handler(action, target) {
  return async (req, res, next) => {
    try {
      const targetId = parsePathId(req.params[target.param], target.param);
      const data = await likeService[action](req.user.memberId, target, targetId);
      return success(res, data);
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  likeQuestion: handler('like', LIKE_TARGETS.QUESTION),
  unlikeQuestion: handler('unlike', LIKE_TARGETS.QUESTION),
  likeAnswer: handler('like', LIKE_TARGETS.ANSWER),
  unlikeAnswer: handler('unlike', LIKE_TARGETS.ANSWER),
};
