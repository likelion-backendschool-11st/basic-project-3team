const express = require('express');
const auth = require('../middlewares/auth');
const likeController = require('./like.controller');

// /api 아래에 연결된다 (docs/api.md 7장).
const router = express.Router();

router.post('/questions/:questionId/likes', auth, likeController.likeQuestion);
router.delete('/questions/:questionId/likes', auth, likeController.unlikeQuestion);
router.post('/answers/:answerId/likes', auth, likeController.likeAnswer);
router.delete('/answers/:answerId/likes', auth, likeController.unlikeAnswer);

module.exports = router;
