import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// 로그인하지 않으면 볼 수 없는 화면을 감싼다. 로그인하지 않았으면 로그인 화면으로 보낸다.
// 새로고침 직후에는 reissue로 로그인 상태를 복구할 때까지 기다린다 (docs/auth.md 재발급 흐름).
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <Navigate replace to="/login" />;
  return children;
}
