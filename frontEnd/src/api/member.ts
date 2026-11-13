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

// 서버(member.constants.js)와 같은 입력값 규칙 (docs/api.md 입력값 규칙)
export const INPUT_PATTERNS = {
  loginId: /^[A-Za-z0-9_.-]{8,12}$/,
  password: /^[A-Za-z0-9_.-]{8,12}$/,
  phone: /^01[0-9]{8,9}$/,
  nickname: /^[가-힣A-Za-z0-9]{2,10}$/,
};

export const INPUT_RULES = {
  loginId: "8~12자, 영문·숫자와 특수기호 _ . - 만 사용할 수 있어요.",
  password: "8~12자, 영문·숫자와 특수기호 _ . - 만 사용할 수 있어요.",
  phone: "01로 시작하는 10~11자리 숫자 (하이픈은 있어도 돼요)",
  nickname: "2~10자, 한글·영문·숫자만 사용할 수 있어요 (공백·특수기호 불가)",
};

// 전화번호는 하이픈을 지우고 검사·전송한다 (docs/api.md).
export function toPhoneDigits(value: string) {
  return value.replace(/-/g, "");
}

// 전화번호 칸에는 숫자와 하이픈만 입력되게 한다.
export function filterPhoneInput(value: string) {
  return value.replace(/[^\d-]/g, "");
}
