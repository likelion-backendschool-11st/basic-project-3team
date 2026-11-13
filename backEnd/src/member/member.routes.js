const express = require('express');
const memberController = require('./member.controller');

const router = express.Router();

router.post('/signup', memberController.signup);
router.get('/check-login-id', memberController.checkLoginId);
router.get('/check-phone', memberController.checkPhone);
router.get('/check-nickname', memberController.checkNickname);

module.exports = router;
