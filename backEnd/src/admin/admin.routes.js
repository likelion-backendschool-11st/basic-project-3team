const express = require('express');
const adminController = require('./admin.controller');

// routes.js에서 /api/admin 아래에 auth + admin 미들웨어 뒤로 연결된다 (ROLE_ADMIN만 접근).
const router = express.Router();

router.get('/reports', adminController.getReports);
router.get('/reports/:reportId', adminController.getReport);
router.patch('/reports/:reportId', adminController.processReport);

module.exports = router;
