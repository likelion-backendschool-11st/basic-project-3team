const express = require('express');
const mainRouter = require('./main/main.routes');
const boardRouter = require('./board/board.routes');

// 도메인 폴더의 라우터를 여기에 연결한다.
const router = express.Router();

// 메인 화면 질문 목록 (GET /api/questions)
router.use('/questions', mainRouter);
// 질문 작성 (POST /api/questions)
router.use('/questions', boardRouter);

module.exports = router;
