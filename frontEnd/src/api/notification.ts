import { api, type ApiResponse } from "./client";
import type { Page } from "./question";

// docs/api.md 9장 알림. 모두 로그인 필요.

export type NotificationType = "ANSWER_CREATED" | "ANSWER_ACCEPTED" | "CATEGORY_QUESTION";

export interface Notification {
  notificationId: number;
  type: NotificationType;
  message: string;
  questionId: number;
  read: boolean;
  createdAt: string;
}

// GET /api/notifications — 최신순
export async function getNotifications(params: { page?: number; size?: number }): Promise<Page<Notification>> {
  const { data } = await api.get<ApiResponse<Page<Notification>>>("/notifications", { params });
  return data.data;
}

// GET /api/notifications/unread-count
export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count");
  return data.data.unreadCount;
}

// PATCH /api/notifications/{notificationId}/read
export async function readNotification(notificationId: number): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

// PATCH /api/notifications/read-all
export async function readAllNotifications(): Promise<number> {
  const { data } = await api.patch<ApiResponse<{ updatedCount: number }>>("/notifications/read-all");
  return data.data.updatedCount;
}
