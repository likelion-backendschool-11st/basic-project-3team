const express = require('express');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const boardController = require('./board.controller');

const router = express.Router();

router.post('/', auth, boardController.createQuestion);
router.get('/:questionId', optionalAuth, boardController.getQuestion);
router.get('/:questionId/similar', boardController.getSimilarQuestions);
router.patch('/:questionId', auth, boardController.updateQuestion);
router.delete('/:questionId', auth, boardController.deleteQuestion);

module.exports = router;
