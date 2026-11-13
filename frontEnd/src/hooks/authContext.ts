import { createContext } from "react";

export interface AuthUser {
  memberId: number;
  nickname: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
}

export interface AuthContextValue {
  user: AuthUser | null;
  // 앱 시작 시 reissue로 로그인 상태를 복구하는 중이면 true
  initializing: boolean;
  login: (loginId: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
