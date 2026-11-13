import { api, type ApiResponse } from "./client";

// docs/api.md 8장 신고 사유. 값은 서버 report.constants.js와 같다.
export const REPORT_REASONS = [
  { value: "SPAM", label: "스팸 · 광고" },
  { value: "ABUSE", label: "욕설 · 비방" },
  { value: "OBSCENE", label: "음란 · 불쾌한 내용" },
  { value: "PRIVACY", label: "개인정보 노출" },
  { value: "OFF_TOPIC", label: "질문과 무관한 내용 · 도배" },
  { value: "COPYRIGHT", label: "저작권 침해" },
  { value: "ETC", label: "기타 (직접 입력)" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
export type ReportTargetType = "QUESTION" | "ANSWER";

// ETC일 때 직접 입력 사유 (앞뒤 공백 제외 1~200자)
export const REASON_DETAIL_MAX = 200;

export interface ReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  reasonDetail?: string;
}

// POST /api/reports — 회원. 본인 글 400, 중복 신고 409 ALREADY_REPORTED
export async function createReport(request: ReportRequest): Promise<{ reportId: number }> {
  const { data } = await api.post<ApiResponse<{ reportId: number }>>("/reports", request);
  return data.data;
}
