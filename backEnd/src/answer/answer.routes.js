const express = require('express');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const answerController = require('./answer.controller');

// /api/questions/:questionId/answers 아래에 연결된다. 상위 경로의 :questionId를 쓰려고 mergeParams를 켠다.
const questionAnswerRouter = express.Router({ mergeParams: true });

questionAnswerRouter.get('/', optionalAuth, answerController.getAnswers);
questionAnswerRouter.post('/', auth, answerController.createAnswer);

// /api/answers 아래에 연결된다. 답변 하나를 대상으로 하는 수정(#43)·삭제(#44)·채택(#45)
const answerRouter = express.Router();

answerRouter.patch('/:answerId', auth, answerController.updateAnswer);
answerRouter.delete('/:answerId', auth, answerController.deleteAnswer);
answerRouter.post('/:answerId/accept', auth, answerController.acceptAnswer);

module.exports = { questionAnswerRouter, answerRouter };
