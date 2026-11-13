const express = require('express');
const mainRouter = require('./main/main.routes');

// 도메인 폴더의 라우터를 여기에 연결한다.
const router = express.Router();

// 메인 화면 질문 목록 (GET /api/questions)
router.use('/questions', mainRouter);

module.exports = router;
