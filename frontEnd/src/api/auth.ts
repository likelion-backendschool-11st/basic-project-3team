import { api, reissue, setAccessToken, type ApiResponse, type LoginResult } from "./client";

// POST /api/auth/login — Refresh Token은 서버가 HttpOnly 쿠키로 내려준다.
export async function login(loginId: string, password: string): Promise<LoginResult> {
  const { data } = await api.post<ApiResponse<LoginResult>>("/auth/login", { loginId, password });
  setAccessToken(data.data.accessToken);
  return data.data;
}

// POST /api/auth/reissue — 앱 시작(새로고침) 시 로그인 상태 복구에도 쓴다.
export { reissue };

// POST /api/auth/logout — 서버 요청이 실패해도 이 브라우저의 토큰은 지운다.
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}
