const express = require('express');
const auth = require('../middlewares/auth');
const replyController = require('./reply.controller');

// /api 아래에 연결된다 (docs/api.md 6장).
const router = express.Router();

router.get('/answers/:answerId/replies', replyController.getReplies);
router.post('/answers/:answerId/replies', auth, replyController.createReply);
router.patch('/replies/:replyId', auth, replyController.updateReply);
router.delete('/replies/:replyId', auth, replyController.deleteReply);

module.exports = router;
