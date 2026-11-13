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

export interface FindLoginIdResult {
  nickname: string;
  maskedLoginId: string;
  createdAt: string;
}

// POST /api/auth/find-login-id — 닉네임 + 전화번호로 본인 확인, 아이디는 앞 3자리만 보여준다.
export async function findLoginId(nickname: string, phone: string): Promise<FindLoginIdResult> {
  const { data } = await api.post<ApiResponse<FindLoginIdResult>>("/auth/find-login-id", { nickname, phone });
  return data.data;
}

// POST /api/auth/password-reset/verify — 아이디 + 전화번호 본인 확인
export async function verifyPasswordReset(loginId: string, phone: string): Promise<void> {
  await api.post("/auth/password-reset/verify", { loginId, phone });
}

// POST /api/auth/password-reset — 성공하면 서버가 모든 기기의 로그인을 끊으므로 이 브라우저의 토큰도 지운다.
export async function resetPassword(loginId: string, phone: string, newPassword: string): Promise<void> {
  await api.post("/auth/password-reset", { loginId, phone, newPassword });
  setAccessToken(null);
}
