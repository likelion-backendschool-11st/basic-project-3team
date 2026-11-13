const express = require('express');
const auth = require('../middlewares/auth');
const answerController = require('./answer.controller');

// /api/questions/:questionId/answers 아래에 연결된다. 상위 경로의 :questionId를 쓰려고 mergeParams를 켠다.
const questionAnswerRouter = express.Router({ mergeParams: true });

questionAnswerRouter.get('/', answerController.getAnswers);
questionAnswerRouter.post('/', auth, answerController.createAnswer);

module.exports = { questionAnswerRouter };
