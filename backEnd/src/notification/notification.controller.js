const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');
const { success } = require('../utils/response');
const { parsePageQuery } = require('../utils/page');

const POSITIVE_INT = /^[1-9]\d*$/;

function parseNotificationId(value) {
  if (!POSITIVE_INT.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new AppError(ErrorCode.INVALID_INPUT, {
      errors: [{ field: 'notificationId', reason: 'notificationId는 1 이상의 정수여야 합니다.' }],
    });
  }
  return Number(value);
}

async function getNotifications(req, res, next) {
  try {
    const { page, size, errors } = parsePageQuery(req.query);
    if (errors.length > 0) {
      throw new AppError(ErrorCode.INVALID_INPUT, { errors });
    }
    return success(res, await notificationService.getNotifications(req.user.memberId, { page, size }));
  } catch (err) {
    return next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    return success(res, await notificationService.getUnreadCount(req.user.memberId));
  } catch (err) {
    return next(err);
  }
}

async function readNotification(req, res, next) {
  try {
    const notificationId = parseNotificationId(req.params.notificationId);
    return success(res, await notificationService.readNotification(req.user.memberId, notificationId));
  } catch (err) {
    return next(err);
  }
}

async function readAllNotifications(req, res, next) {
  try {
    return success(res, await notificationService.readAllNotifications(req.user.memberId));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getNotifications, getUnreadCount, readNotification, readAllNotifications };
