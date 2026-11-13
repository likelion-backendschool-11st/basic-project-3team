import { api, type ApiResponse } from "./client";

export type Grade = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

// docs/api.md 1장 페이징 응답
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

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

// PATCH /api/members/me/profile — 보낸 필드만 바꾼다. bio·careerYears는 null로 지운다.
export interface ProfileUpdateRequest {
  nickname?: string;
  bio?: string | null;
  careerYears?: number | null;
  techStacks?: string[];
}

// PATCH /api/members/me/private — currentPassword는 필수, newPassword·phone은 바꿀 값만 보낸다.
export interface PrivateUpdateRequest {
  currentPassword: string;
  newPassword?: string;
  phone?: string;
}

// GET /api/members/me/accepted-answers — 채택일 최신순
export interface AcceptedAnswer {
  answerId: number;
  questionId: number;
  questionTitle: string;
  acceptedAt: string;
}

// GET /api/members/me/questions, /me/answers — 작성일 최신순 (답변은 answerId가 더 있다)
export interface MyPost {
  questionId: number;
  answerId?: number;
  title: string;
  createdAt: string;
  accepted: boolean;
  likeCount: number;
}

export type BadgeCode = "FIRST_QUESTION" | "FIRST_ANSWER" | "FIRST_ACCEPTED" | "CURIOUS" | "SOLVER" | "POPULAR_ANSWER";

// GET /api/members/me/grade — 등급·뱃지는 조회할 때 계산한다 (docs/api.md 3장 내 등급·뱃지 조회)
export interface Badge {
  code: BadgeCode;
  name: string;
  condition: string;
  acquired: boolean;
  current: number;
  target: number;
}

export interface GradeInfo {
  grade: Grade;
  nextGrade: Grade | null;
  nextGradeCondition: string | null;
  acceptedCount: number;
  nextGradeMin: number | null;
  badges: Badge[];
}

export async function getMyGrade(): Promise<GradeInfo> {
  const { data } = await api.get<ApiResponse<GradeInfo>>("/members/me/grade");
  return data.data;
}

// GET·PUT /api/members/me/categories — 관심 카테고리·알림 설정 (변경은 목록 전체 교체)
export interface CategorySetting {
  categoryIds: number[];
  notificationEnabled: boolean;
}

export async function getMyCategories(): Promise<CategorySetting> {
  const { data } = await api.get<ApiResponse<CategorySetting>>("/members/me/categories");
  return data.data;
}

export async function updateMyCategories(setting: CategorySetting): Promise<void> {
  await api.put<ApiResponse<null>>("/members/me/categories", setting);
}

export async function getMyInfo(): Promise<MyInfo> {
  const { data } = await api.get<ApiResponse<MyInfo>>("/members/me");
  return data.data;
}

export async function getProfile(memberId: number): Promise<Profile> {
  const { data } = await api.get<ApiResponse<Profile>>(`/members/${memberId}`);
  return data.data;
}

export async function updateProfile(request: ProfileUpdateRequest): Promise<void> {
  await api.patch<ApiResponse<null>>("/members/me/profile", request);
}

export async function updatePrivate(request: PrivateUpdateRequest): Promise<void> {
  await api.patch<ApiResponse<null>>("/members/me/private", request);
}

export async function getAcceptedAnswers(page = 0, size = 10): Promise<Page<AcceptedAnswer>> {
  const { data } = await api.get<ApiResponse<Page<AcceptedAnswer>>>("/members/me/accepted-answers", {
    params: { page, size },
  });
  return data.data;
}

export async function getMyQuestions(page = 0, size = 10): Promise<Page<MyPost>> {
  const { data } = await api.get<ApiResponse<Page<MyPost>>>("/members/me/questions", { params: { page, size } });
  return data.data;
}

export async function getMyAnswers(page = 0, size = 10): Promise<Page<MyPost>> {
  const { data } = await api.get<ApiResponse<Page<MyPost>>>("/members/me/answers", { params: { page, size } });
  return data.data;
}
