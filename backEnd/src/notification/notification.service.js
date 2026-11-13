const notificationRepository = require('./notification.repository');
const { emitNotification } = require('./notification.socket');
const { NOTIFICATION_TYPE } = require('./notification.constants');
const { getOffset, toPage } = require('../utils/page');
const AppError = require('../utils/AppError');
const ErrorCode = require('../utils/errorCode');

function toItem(row) {
  return {
    notificationId: row.notificationId,
    type: row.type,
    message: row.message,
    questionId: row.questionId,
    read: Boolean(row.isRead),
    createdAt: row.createdAt,
  };
}

// 알림 목록 (최신순)
async function getNotifications(memberId, { page, size }) {
  const [rows, totalElements] = await Promise.all([
    notificationRepository.findNotifications(memberId, { limit: size, offset: getOffset(page, size) }),
    notificationRepository.countNotifications(memberId),
  ]);
  return toPage(rows.map(toItem), page, size, Number(totalElements));
}

async function getUnreadCount(memberId) {
  return { unreadCount: Number(await notificationRepository.countUnread(memberId)) };
}

// 읽음 처리. 이미 읽었어도 200. 다른 회원의 알림이면 403.
async function readNotification(memberId, notificationId) {
  const ownerId = await notificationRepository.findNotificationOwner(notificationId);
  if (ownerId === null) {
    throw new AppError(ErrorCode.NOTIFICATION_NOT_FOUND);
  }
  if (Number(ownerId) !== Number(memberId)) {
    throw new AppError(ErrorCode.FORBIDDEN);
  }
  await notificationRepository.markRead(notificationId);
  return { notificationId, read: true };
}

async function readAllNotifications(memberId) {
  return { updatedCount: await notificationRepository.markAllRead(memberId) };
}

// ---- 다른 도메인에서 부르는 알림 생성 함수 ----
// 글 작성·채택이 성공한 뒤(트랜잭션 commit 뒤) 부른다. 알림이 실패해도 원래 요청은 성공으로 두고 로그만 남긴다.

async function saveAndSend(items) {
  const rows = await notificationRepository.insertNotifications(items);
  for (const row of rows) {
    emitNotification(row.memberId, toItem(row));
  }
  return rows.length;
}

async function safely(work, label) {
  try {
    return await work();
  } catch (err) {
    console.error(`알림 생성 실패 (${label})`, err);
    return 0;
  }
}

// REQ-NOTI-001: 답변이 달리면 질문 작성자에게. 자기 질문에 자기가 답하면 보내지 않는다.
function notifyAnswerCreated({ questionId, answerWriterId }) {
  return safely(async () => {
    const question = await notificationRepository.findQuestionForNotification(questionId);
    if (question === null || Number(question.writerId) === Number(answerWriterId)) {
      return 0;
    }
    return saveAndSend([
      {
        memberId: question.writerId,
        type: NOTIFICATION_TYPE.ANSWER_CREATED,
        message: `'${question.title}'에 새 답변이 달렸습니다.`,
        questionId,
      },
    ]);
  }, 'ANSWER_CREATED');
}

// REQ-NOTI-002: 답변이 채택되면 답변 작성자에게. (본인 답변은 채택할 수 없지만 한 번 더 확인한다.)
function notifyAnswerAccepted({ questionId, answerId, acceptorId }) {
  return safely(async () => {
    const [question, answerWriterId] = await Promise.all([
      notificationRepository.findQuestionForNotification(questionId),
      notificationRepository.findAnswerWriterId(answerId),
    ]);
    if (question === null || answerWriterId === null || Number(answerWriterId) === Number(acceptorId)) {
      return 0;
    }
    return saveAndSend([
      {
        memberId: answerWriterId,
        type: NOTIFICATION_TYPE.ANSWER_ACCEPTED,
        message: `'${question.title}'에 단 내 답변이 채택되었습니다.`,
        questionId,
      },
    ]);
  }, 'ANSWER_ACCEPTED');
}

// REQ-MYPAGE-004: 관심 카테고리에 새 질문이 올라오면, 알림을 켠 회원에게. 작성자 본인은 제외.
function notifyCategoryQuestion({ questionId }) {
  return safely(async () => {
    const question = await notificationRepository.findQuestionForNotification(questionId);
    if (question === null) {
      return 0;
    }
    const subscribers = await notificationRepository.findCategorySubscribers(question.categoryId, question.writerId);
    return saveAndSend(
      subscribers.map((memberId) => ({
        memberId,
        type: NOTIFICATION_TYPE.CATEGORY_QUESTION,
        message: `관심 카테고리 '${question.categoryName}'에 새 질문이 올라왔습니다: '${question.title}'`,
        questionId,
      })),
    );
  }, 'CATEGORY_QUESTION');
}

module.exports = {
  getNotifications,
  getUnreadCount,
  readNotification,
  readAllNotifications,
  notifyAnswerCreated,
  notifyAnswerAccepted,
  notifyCategoryQuestion,
};
