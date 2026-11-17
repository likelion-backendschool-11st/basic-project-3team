import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { io } from "socket.io-client";
import { getAccessToken, getErrorMessage, reissue } from "../../api/client";
import {
  deleteAllNotifications,
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
// 실시간 연결이 끊겨 있는 동안 안 읽은 수를 다시 불러오는 간격
const FALLBACK_POLL_MS = 30_000;
// 탭으로 돌아올 때 이 시간 안에 이미 불렀으면 다시 부르지 않는다
const REFETCH_DEDUPE_MS = 1_000;
// 서버가 토큰 문제로 접속을 거절할 때 보내는 코드 (docs/api.md 9장)
const SOCKET_AUTH_ERRORS = new Set(["UNAUTHORIZED", "INVALID_TOKEN", "TOKEN_EXPIRED"]);
// 재발급 후에도 계속 거절되면(서버 설정 문제 등) 무한 반복하지 않도록 연속 재시도 횟수를 제한한다
const MAX_AUTH_RETRIES = 3;
// 실시간 알림을 접속할 백엔드 주소 (frontEnd/.env의 VITE_SOCKET_URL, #75).
// 비어 있으면 지금 화면과 같은 주소로 접속한다 (개발 환경의 Vite 프록시).
// Vercel은 WebSocket을 백엔드로 넘기지 않으므로 배포에서는 백엔드 주소를 넣는다.
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || "").replace(/\/+$/, "") || undefined;

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
    let disposed = false;
    let lastFetchedAt = 0;
    const loadUnreadCount = () => {
      lastFetchedAt = Date.now();
      getUnreadCount()
        .then((count) => {
          if (!disposed) setUnreadCount(count);
        })
        .catch(() => {
          // 배지만 못 보여 줄 뿐 화면은 그대로 쓴다.
        });
    };
    loadUnreadCount();

    // 예비 장치: 실시간 연결이 끊겨 있는 동안에만 안 읽은 수를 주기적으로 다시 불러온다.
    // 이 요청이 401 TOKEN_EXPIRED를 받으면 axios 인터셉터가 재발급하고, 재발급도 실패하면 로그인 화면으로 보낸다.
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (pollTimer === null) pollTimer = setInterval(loadUnreadCount, FALLBACK_POLL_MS);
    };
    const stopPolling = () => {
      if (pollTimer !== null) clearInterval(pollTimer);
      pollTimer = null;
    };
    // 첫 연결 전에도 끊긴 상태로 본다 (연결되면 바로 멈춘다).
    startPolling();

    // auth를 함수로 넘겨, 다시 접속할 때마다 그때의 Access Token을 쓴다 (재발급 후 재연결).
    const socket = io(SOCKET_URL, {
      auth: (cb) => cb({ token: getAccessToken() }),
      transports: ["websocket"],
    });
    let connectedOnce = false;
    let authRetries = 0;
    socket.on("connect", () => {
      stopPolling();
      authRetries = 0;
      // 다시 연결됐으면 끊겨 있던 동안 온 알림 수를 맞춘다 (첫 연결은 위에서 이미 불렀다).
      if (connectedOnce) loadUnreadCount();
      connectedOnce = true;
    });
    socket.on("notification", (notification: Notification) => {
      setItems((prev) => [notification, ...prev.filter((n) => n.notificationId !== notification.notificationId)]);
      setUnreadCount((count) => count + 1);
    });
    socket.on("disconnect", (reason) => {
      startPolling();
      // 서버가 끊으면 socket.io가 스스로 다시 접속하지 않으므로 직접 다시 접속한다.
      if (reason === "io server disconnect") socket.connect();
    });
    // 서버가 토큰 문제로 접속을 거절하면(TOKEN_EXPIRED·UNAUTHORIZED·INVALID_TOKEN) socket.io는 다시 시도하지 않는다.
    // 재발급해서 새 토큰으로 다시 접속한다. 서버가 꺼져 있는 등 연결 자체가 안 될 때는 socket.io가 알아서 다시 시도한다(active).
    // 재발급이 실패하거나 계속 거절되면 멈추고, 위의 예비 조회가 숫자를 맞추고 세션 만료를 처리한다.
    socket.on("connect_error", (err) => {
      if (socket.active || !SOCKET_AUTH_ERRORS.has(err.message) || authRetries >= MAX_AUTH_RETRIES) return;
      authRetries += 1;
      reissue()
        .then(() => {
          if (!disposed) socket.connect();
        })
        .catch(() => {});
    });

    // 예비 장치: 브라우저 탭으로 돌아오면 안 읽은 수를 다시 불러온다.
    // visibilitychange와 focus가 거의 같이 오므로 짧은 시간 안의 중복 조회는 건너뛴다.
    const handleReturn = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastFetchedAt < REFETCH_DEDUPE_MS) return;
      loadUnreadCount();
    };
    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("focus", handleReturn);
      socket.disconnect();
      stopPolling();
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

  // 서버에서 내 알림을 모두 지운 뒤 화면도 비운다. 실패하면 그대로 두고 에러를 넘긴다.
  const deleteAll = useCallback(async () => {
    await deleteAllNotifications();
    setItems([]);
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, loading, error, refresh, markRead, markAllRead, deleteAll }),
    [items, unreadCount, loading, error, refresh, markRead, markAllRead, deleteAll],
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
