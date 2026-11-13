import type { BadgeCode, Grade } from "../api/mypage";

// 등급 순서 = 레벨 (BRONZE=LV.1 … PLATINUM=LV.4, docs/api.md 3장)
export const GRADE_ORDER: Grade[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

export const GRADE_NAME: Record<Grade, string> = {
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
};

// 등급 기준: 채택된 답변 수 (서버 mypage.constants.js의 GRADES와 같은 값)
export const GRADE_MIN_ACCEPTED: Record<Grade, number> = {
  BRONZE: 0,
  SILVER: 5,
  GOLD: 20,
  PLATINUM: 50,
};

export function gradeLevel(grade: Grade) {
  return GRADE_ORDER.indexOf(grade) + 1;
}

// 뱃지 아이콘: 마이페이지 요약 카드는 이모지, 등급·뱃지 화면은 Font Awesome 아이콘을 쓴다.
export const BADGE_ICON: Record<BadgeCode, { emoji: string; fa: string }> = {
  FIRST_QUESTION: { emoji: "❓", fa: "fa-question" },
  FIRST_ANSWER: { emoji: "💬", fa: "fa-comment-dots" },
  FIRST_ACCEPTED: { emoji: "✅", fa: "fa-check" },
  CURIOUS: { emoji: "🙋", fa: "fa-lightbulb" },
  SOLVER: { emoji: "🏆", fa: "fa-trophy" },
  POPULAR_ANSWER: { emoji: "❤️", fa: "fa-heart" },
};
