const express = require('express');
const auth = require('../middlewares/auth');
const mypageController = require('./mypage.controller');

// 마이페이지 (/api/members/me/**, /api/members/{memberId})
const router = express.Router();

// /me 라우트를 /:memberId보다 먼저 둔다.
router.get('/me', auth, mypageController.getMe);
router.patch('/me/profile', auth, mypageController.updateProfile);
router.patch('/me/private', auth, mypageController.updatePrivate);
router.get('/me/categories', auth, mypageController.getCategories);
router.put('/me/categories', auth, mypageController.updateCategories);
router.get('/me/grade', auth, mypageController.getGrade);
router.get('/me/accepted-answers', auth, mypageController.getAcceptedAnswers);
router.get('/me/questions', auth, mypageController.getMyQuestions);
router.get('/me/answers', auth, mypageController.getMyAnswers);

router.get('/:memberId', mypageController.getProfile);

module.exports = router;
