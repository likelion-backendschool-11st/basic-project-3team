const express = require('express');
const auth = require('../middlewares/auth');
const notificationController = require('./notification.controller');

// /api/notifications — 모두 로그인 필요. read-all을 /:notificationId/read보다 먼저 둔다.
const router = express.Router();

router.use(auth);
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.readAllNotifications);
router.patch('/:notificationId/read', notificationController.readNotification);

module.exports = router;
