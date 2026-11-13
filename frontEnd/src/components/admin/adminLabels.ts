import type { MemberStatus, ReportReason, ReportStatus, ReportTargetType } from "../../api/admin";

// routes.ts에 등록된 관리자 화면 주소
export const ADMIN_REPORTS_PATH = "/admin-reports";
export const ADMIN_MEMBERS_PATH = "/admin-members";

// 관리자 화면에 보여 줄 한글 이름. 신고 사유는 REQ-QUESTION-011의 문구와 같다.

export const TARGET_TYPE_LABEL: Record<ReportTargetType, string> = {
  QUESTION: "질문",
  ANSWER: "답변",
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  SPAM: "스팸 · 광고",
  ABUSE: "욕설 · 비방",
  OBSCENE: "음란 · 불쾌한 내용",
  PRIVACY: "개인정보 노출",
  OFF_TOPIC: "질문과 무관한 내용 · 도배",
  COPYRIGHT: "저작권 침해",
  ETC: "기타",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "처리 대기", className: "bg-yellow-200" },
  RESOLVED: { label: "처리 완료", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "반려", className: "bg-gray-100 text-neutral-700" },
};

export const MEMBER_STATUS_LABEL: Record<MemberStatus, { label: string; className: string }> = {
  ACTIVE: { label: "정상", className: "bg-green-100 text-green-800" },
  BANNED: { label: "정지", className: "bg-red-100 text-red-700" },
  WITHDRAWN: { label: "탈퇴", className: "bg-gray-100 text-neutral-600" },
};
