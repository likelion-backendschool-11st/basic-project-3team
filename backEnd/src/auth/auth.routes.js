const express = require('express');
const auth = require('../middlewares/auth');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.post('/reissue', authController.reissue);
router.post('/logout', auth, authController.logout);

// 아이디 찾기, 비밀번호 재설정 (본인 확인: 전화번호, #37)
router.post('/find-login-id', authController.findLoginId);
router.post('/password-reset/verify', authController.verifyPasswordReset);
router.post('/password-reset', authController.resetPassword);

module.exports = router;
