import type { BadgeCode, Grade } from "../api/mypage";

// 등급·뱃지 값은 이 파일 한 곳에서만 정한다 (docs/ui-guide.md 7절). 아이콘 모양은 GradeIcon.tsx, BadgeIcon.tsx.

// 등급 순서 = 레벨 (BRONZE=LV.1 … PLATINUM=LV.4, docs/api.md 3장)
export const GRADE_ORDER: Grade[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

// minAccepted: 등급 기준인 채택된 답변 수 (서버 mypage.constants.js의 GRADES와 같은 값)
// color: 메달 아이콘 색. 금속 색은 등급과 랭킹 메달에만 쓰는 예외다.
export const GRADES: Record<Grade, { label: string; color: string; minAccepted: number }> = {
  BRONZE: { label: "브론즈", color: "#CD7F32", minAccepted: 0 },
  SILVER: { label: "실버", color: "#9CA3AF", minAccepted: 5 },
  GOLD: { label: "골드", color: "#EAB308", minAccepted: 20 },
  PLATINUM: { label: "플래티넘", color: "#06B6D4", minAccepted: 50 },
};

export function gradeLevel(grade: Grade) {
  return GRADE_ORDER.indexOf(grade) + 1;
}

// 획득 뱃지 아이콘: Material Symbols 이름 (ui-guide.md 7절, 9절)
export const BADGE_ICON: Record<BadgeCode, string> = {
  FIRST_QUESTION: "help",
  FIRST_ANSWER: "chat_bubble",
  FIRST_ACCEPTED: "check_circle",
  CURIOUS: "lightbulb",
  SOLVER: "emoji_events",
  POPULAR_ANSWER: "favorite",
};
