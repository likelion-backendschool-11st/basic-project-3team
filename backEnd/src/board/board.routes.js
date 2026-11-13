const express = require('express');
const auth = require('../middlewares/auth');
const boardController = require('./board.controller');

const router = express.Router();

router.post('/', auth, boardController.createQuestion);

module.exports = router;
