const express = require('express');
const auth = require('../middlewares/auth');
const boardController = require('./board.controller');

const router = express.Router();

router.post('/', auth, boardController.createQuestion);
router.get('/:questionId', boardController.getQuestion);
router.patch('/:questionId', auth, boardController.updateQuestion);

module.exports = router;
