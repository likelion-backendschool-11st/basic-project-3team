import { api, setAccessToken, type ApiResponse } from "./client";

// DELETE /api/members/me — 회원 탈퇴 (REQ-MYPAGE-009). 서버가 Refresh 쿠키를 지우므로 이 브라우저의 토큰도 지운다.
export async function withdraw(password: string): Promise<void> {
  await api.delete("/members/me", { data: { password } });
  setAccessToken(null);
}

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
  phone: "01로 시작하는 10~11자리 숫자 (하이픈은 자동으로 들어가요)",
  nickname: "2~10자, 한글·영문·숫자만 사용할 수 있어요 (공백·특수기호 불가)",
};

// 전화번호는 하이픈을 지우고 검사·전송한다 (docs/api.md).
export function toPhoneDigits(value: string) {
  return value.replace(/-/g, "");
}

// 전화번호 칸에 숫자만 받고 하이픈을 자동으로 넣는다 (개인정보 수정 화면과 같은 방식).
// 01012345678 → 010-1234-5678, 0101234567 → 010-123-4567
export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  const middle = digits.length === 11 ? 4 : 3;
  return `${digits.slice(0, 3)}-${digits.slice(3, 3 + middle)}-${digits.slice(3 + middle)}`;
}
