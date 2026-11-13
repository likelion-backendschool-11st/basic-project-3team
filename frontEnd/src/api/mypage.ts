import { api, type ApiResponse } from "./client";

export type Grade = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

// GET /api/members/{memberId} — 공개 프로필 (docs/api.md 3장 프로필 조회)
export interface Profile {
  memberId: number;
  nickname: string;
  bio: string | null;
  careerYears: number | null;
  techStacks: string[];
  grade: Grade;
  acceptRate: number;
}

// GET /api/members/me — 공개 프로필 + 개인정보 (docs/api.md 3장 내 정보 조회)
export interface MyInfo extends Profile {
  loginId: string;
  phone: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
  createdAt: string;
}

// PATCH /api/members/me/private — currentPassword는 필수, newPassword·phone은 바꿀 값만 보낸다.
export interface PrivateUpdateRequest {
  currentPassword: string;
  newPassword?: string;
  phone?: string;
}

export async function getMyInfo(): Promise<MyInfo> {
  const { data } = await api.get<ApiResponse<MyInfo>>("/members/me");
  return data.data;
}

export async function updatePrivate(request: PrivateUpdateRequest): Promise<void> {
  await api.patch<ApiResponse<null>>("/members/me/private", request);
}
