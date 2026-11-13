import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { io } from "socket.io-client";
import { getAccessToken, getErrorMessage, reissue } from "../../api/client";
import {
  getNotifications,
  getUnreadCount,
  readAllNotifications,
  readNotification,
  type Notification,
} from "../../api/notification";
import { useAuth } from "../../hooks/useAuth";
import { NotificationContext } from "../../hooks/notificationContext";

// 팝오버에 보여 줄 최근 알림 수
const RECENT_SIZE = 20;

// 알림 상태와 실시간 연결을 앱 전체에서 하나만 유지한다 (#70, docs/api.md 9장).
// 헤더는 화면마다 새로 그려지므로, 연결을 여기(AuthProvider 안)에 두어 화면을 옮겨도 끊기지 않게 한다.
export default function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const memberId = user?.memberId ?? null;
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, count] = await Promise.all([getNotifications({ page: 0, size: RECENT_SIZE }), getUnreadCount()]);
      setItems(page.content);
      setUnreadCount(count);
    } catch (err) {
      setError(getErrorMessage(err, "알림을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그인하면 안 읽은 수를 불러오고 실시간 연결을 연다. 로그아웃하면 끊고 비운다.
  useEffect(() => {
    if (memberId === null) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {
        // 배지만 못 보여 줄 뿐 화면은 그대로 쓴다.
      });

    // auth를 함수로 넘겨, 다시 접속할 때마다 그때의 Access Token을 쓴다 (재발급 후 재연결).
    const socket = io({
      auth: (cb) => cb({ token: getAccessToken() }),
      transports: ["websocket"],
    });
    socket.on("notification", (notification: Notification) => {
      setItems((prev) => [notification, ...prev.filter((n) => n.notificationId !== notification.notificationId)]);
      setUnreadCount((count) => count + 1);
    });
    // 토큰이 만료돼 접속을 거부당하면 재발급한 뒤 다시 접속한다. 재발급도 실패하면 AuthProvider가 로그아웃시킨다.
    socket.on("connect_error", (err) => {
      if (err.message === "TOKEN_EXPIRED") {
        reissue()
          .then(() => socket.connect())
          .catch(() => {});
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [memberId]);

  const markRead = useCallback(
    async (notificationId: number) => {
      const target = items.find((n) => n.notificationId === notificationId);
      if (!target || target.read) return;
      await readNotification(notificationId);
      setItems((prev) => prev.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n)));
      setUnreadCount((count) => Math.max(0, count - 1));
    },
    [items],
  );

  const markAllRead = useCallback(async () => {
    await readAllNotifications();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, loading, error, refresh, markRead, markAllRead }),
    [items, unreadCount, loading, error, refresh, markRead, markAllRead],
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
