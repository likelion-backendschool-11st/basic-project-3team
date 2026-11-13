const express = require('express');
const mainRouter = require('./main/main.routes');
const questionRouter = require('./question/question.routes');
const boardRouter = require('./board/board.routes');
const memberRouter = require('./member/member.routes');
const authRouter = require('./auth/auth.routes');
const reportRouter = require('./report/report.routes');
const auth = require('./middlewares/auth');
const admin = require('./middlewares/admin');

// 도메인 폴더의 라우터를 여기에 연결한다.
const router = express.Router();

// 로그인, 토큰 재발급, 로그아웃 (/api/auth/**)
router.use('/auth', authRouter);

// 관리자 API(/api/admin/**)는 모두 로그인 + ROLE_ADMIN이 필요하다. 관리자 라우터는 이 줄 아래에 연결한다.
router.use('/admin', auth, admin);

// 메인 화면 질문 목록 (GET /api/questions)
router.use('/questions', mainRouter);
// 질문 검색 (GET /api/questions/search)
// board의 /questions/{questionId}보다 먼저 연결해야 /search가 questionId로 잡히지 않는다.
router.use('/questions', questionRouter);
// 질문 작성·상세 조회 (POST /api/questions, GET /api/questions/:questionId)
router.use('/questions', boardRouter);

// 회원가입, 중복 확인 (/api/members/**)
router.use('/members', memberRouter);

// 질문·답변 신고 (POST /api/reports)
router.use('/reports', reportRouter);

module.exports = router;
