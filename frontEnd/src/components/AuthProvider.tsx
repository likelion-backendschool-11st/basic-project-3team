import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { setSessionExpiredHandler, type LoginResult } from "../api/client";
import { AuthContext, type AuthUser } from "../hooks/authContext";

function toUser({ memberId, nickname, role }: LoginResult): AuthUser {
  return { memberId, nickname, role };
}

// 로그인 정보를 앱 전체에 공유한다. BrowserRouter 안에 둔다 (세션 만료 시 로그인 화면으로 이동).
export default function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // 새로고침하면 메모리의 Access Token이 사라지므로 Refresh 쿠키로 한 번 복구한다 (docs/auth.md).
  useEffect(() => {
    let cancelled = false;
    authApi
      .reissue()
      .then((result) => {
        if (!cancelled) setUser(toUser(result));
      })
      .catch(() => {
        // 로그인하지 않은 상태 (쿠키 없음·만료)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 재발급도 실패하면 로그아웃 상태로 바꾸고 로그인 화면으로 보낸다.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      navigate("/login", { replace: true });
    });
    return () => setSessionExpiredHandler(() => {});
  }, [navigate]);

  const login = useCallback(async (loginId: string, password: string) => {
    const loggedIn = toUser(await authApi.login(loginId, password));
    setUser(loggedIn);
    return loggedIn;
  }, []);

  // 서버 요청이 실패해도(이미 만료 등) 이 브라우저는 로그아웃 상태로 바꾼다.
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 토큰은 authApi.logout에서 이미 지웠다.
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(toUser(await authApi.reissue()));
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, logout, refreshUser }),
    [user, initializing, login, logout, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
