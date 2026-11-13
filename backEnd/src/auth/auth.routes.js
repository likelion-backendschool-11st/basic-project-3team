const express = require('express');
const auth = require('../middlewares/auth');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.post('/reissue', authController.reissue);
router.post('/logout', auth, authController.logout);

module.exports = router;
