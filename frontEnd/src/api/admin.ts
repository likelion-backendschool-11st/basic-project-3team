import { api, type ApiResponse } from "./client";
import type { Page } from "./question";

// docs/api.md 11장 관리자 API. 모두 ROLE_ADMIN만 호출할 수 있다.

export type ReportTargetType = "QUESTION" | "ANSWER";
export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";
export type ReportReason = "SPAM" | "ABUSE" | "OBSCENE" | "PRIVACY" | "OFF_TOPIC" | "COPYRIGHT" | "ETC";
export type ReportSort = "latest" | "oldest" | "reports";
export type ReportAction = "DELETE_TARGET" | "REJECT";
export type MemberStatus = "ACTIVE" | "BANNED" | "WITHDRAWN";

interface MemberRef {
  memberId: number;
  nickname: string;
}

export interface ReportSummary {
  reportId: number;
  targetType: ReportTargetType;
  targetId: number;
  questionId: number | null;
  targetTitle: string | null;
  targetDeleted: boolean;
  reporter: MemberRef;
  targetWriter: MemberRef;
  reason: ReportReason;
  reasonDetail: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface ReportListItem extends ReportSummary {
  reportCount: number;
}

export interface ReportDetail extends ReportSummary {
  targetContent: string | null;
}

export interface ReportListParams {
  page?: number;
  size?: number;
  targetType?: ReportTargetType;
  status?: ReportStatus;
  sort?: ReportSort;
}

export interface AdminMember {
  memberId: number;
  loginId: string;
  nickname: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
  status: MemberStatus;
  reportedCount: number;
  createdAt: string;
}

export interface MemberListParams {
  page?: number;
  size?: number;
  status?: MemberStatus;
  keyword?: string;
}

// GET /api/admin/reports
export async function getReports(params: ReportListParams): Promise<Page<ReportListItem>> {
  const { data } = await api.get<ApiResponse<Page<ReportListItem>>>("/admin/reports", { params });
  return data.data;
}

// GET /api/admin/reports/{reportId} — 대상이 삭제됐어도 내용을 준다.
export async function getReport(reportId: number): Promise<ReportDetail> {
  const { data } = await api.get<ApiResponse<ReportDetail>>(`/admin/reports/${reportId}`);
  return data.data;
}

// PATCH /api/admin/reports/{reportId} — 같은 대상의 다른 대기 신고도 함께 처리된다.
export async function processReport(
  reportId: number,
  action: ReportAction,
): Promise<{ reportId: number; status: ReportStatus; processedCount: number }> {
  const { data } = await api.patch<ApiResponse<{ reportId: number; status: ReportStatus; processedCount: number }>>(
    `/admin/reports/${reportId}`,
    { action },
  );
  return data.data;
}

// GET /api/admin/members
export async function getMembers(params: MemberListParams): Promise<Page<AdminMember>> {
  const { data } = await api.get<ApiResponse<Page<AdminMember>>>("/admin/members", { params });
  return data.data;
}

// PATCH /api/admin/members/{memberId}/status — ACTIVE(해제) / BANNED(정지)
export async function changeMemberStatus(
  memberId: number,
  status: Exclude<MemberStatus, "WITHDRAWN">,
): Promise<{ memberId: number; status: MemberStatus }> {
  const { data } = await api.patch<ApiResponse<{ memberId: number; status: MemberStatus }>>(
    `/admin/members/${memberId}/status`,
    { status },
  );
  return data.data;
}
