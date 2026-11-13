import { createContext, useContext } from "react";
import type { Notification } from "../api/notification";

export interface NotificationContextValue {
  // 최근 알림 (팝오버에 보여 줄 첫 페이지 + 실시간으로 받은 알림)
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  // 팝오버를 열 때 목록을 다시 불러온다.
  refresh: () => Promise<void>;
  markRead: (notificationId: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

// 알림 상태를 꺼낸다. NotificationProvider 안에서만 쓸 수 있다.
export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) {
    throw new Error("useNotifications는 NotificationProvider 안에서만 사용할 수 있습니다.");
  }
  return value;
}
