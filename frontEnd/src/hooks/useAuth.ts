import { useContext } from "react";
import { AuthContext } from "./authContext";

// 로그인 정보(user)와 login/logout을 꺼낸다. AuthProvider 안에서만 쓸 수 있다.
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return value;
}
