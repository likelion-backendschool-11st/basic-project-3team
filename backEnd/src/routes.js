const express = require('express');
const mainRouter = require('./main/main.routes');
const questionRouter = require('./question/question.routes');
const boardRouter = require('./board/board.routes');
const { questionAnswerRouter, answerRouter } = require('./answer/answer.routes');
const likeRouter = require('./like/like.routes');
const replyRouter = require('./reply/reply.routes');
const memberRouter = require('./member/member.routes');
const authRouter = require('./auth/auth.routes');
const reportRouter = require('./report/report.routes');
const adminRouter = require('./admin/admin.routes');
const tagRouter = require('./tag/tag.routes');
const categoryRouter = require('./tag/category.routes');
const notificationRouter = require('./notification/notification.routes');
const auth = require('./middlewares/auth');
const admin = require('./middlewares/admin');

// 도메인 폴더의 라우터를 여기에 연결한다.
const router = express.Router();

// 로그인, 토큰 재발급, 로그아웃 (/api/auth/**)
router.use('/auth', authRouter);

// 관리자 API(/api/admin/**)는 모두 로그인 + ROLE_ADMIN이 필요하다. 관리자 라우터는 이 줄 아래에 연결한다.
router.use('/admin', auth, admin);
// 신고 목록·상세·처리 (/api/admin/reports/**), 회원 목록·정지 (/api/admin/members/**)
router.use('/admin', adminRouter);

// 메인 화면 질문 목록 (GET /api/questions)
router.use('/questions', mainRouter);
// 질문 검색 (GET /api/questions/search)
// board의 /questions/{questionId}보다 먼저 연결해야 /search가 questionId로 잡히지 않는다.
router.use('/questions', questionRouter);
// 질문 작성·상세 조회·수정·삭제 (POST /api/questions, GET·PATCH·DELETE /api/questions/:questionId)
router.use('/questions', boardRouter);
// 답변 작성·목록 (POST·GET /api/questions/:questionId/answers)
router.use('/questions/:questionId/answers', questionAnswerRouter);
// 답변 수정·삭제·채택 (PATCH·DELETE /api/answers/:answerId, POST /api/answers/:answerId/accept)
router.use('/answers', answerRouter);
// 질문·답변 좋아요·취소 (POST·DELETE /api/questions/:questionId/likes, /api/answers/:answerId/likes)
router.use(likeRouter);
// 답글 목록·작성·수정·삭제 (GET·POST /api/answers/:answerId/replies, PATCH·DELETE /api/replies/:replyId)
router.use(replyRouter);

// 회원가입, 중복 확인 (/api/members/**)
router.use('/members', memberRouter);

// 질문·답변 신고 (POST /api/reports)
router.use('/reports', reportRouter);

// 태그 목록·인기 태그·추천 태그 (/api/tags/**), 카테고리 목록 (GET /api/categories)
router.use('/tags', tagRouter);
router.use('/categories', categoryRouter);

// 알림 목록·안 읽은 수·읽음 처리 (/api/notifications/**). 실시간 전송은 app.js에서 socket.io로 연결한다.
router.use('/notifications', notificationRouter);

module.exports = router;
