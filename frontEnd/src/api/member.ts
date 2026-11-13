import { api, type ApiResponse } from "./client";

export interface SignupRequest {
  loginId: string;
  password: string;
  nickname: string;
  phone: string;
}

export type DuplicateField = "loginId" | "phone" | "nickname";

const CHECK_PATHS: Record<DuplicateField, string> = {
  loginId: "/members/check-login-id",
  phone: "/members/check-phone",
  nickname: "/members/check-nickname",
};

// POST /api/members/signup — 가입 후 자동 로그인하지 않는다 (토큰 없음).
export async function signup(request: SignupRequest): Promise<{ memberId: number }> {
  const { data } = await api.post<ApiResponse<{ memberId: number }>>("/members/signup", request);
  return data.data;
}

// GET /api/members/check-{login-id|phone|nickname} — 사용할 수 있으면 true
export async function checkAvailable(field: DuplicateField, value: string): Promise<boolean> {
  const { data } = await api.get<ApiResponse<{ available: boolean }>>(CHECK_PATHS[field], {
    params: { [field]: value },
  });
  return data.data.available;
}
