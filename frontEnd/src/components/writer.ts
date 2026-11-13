import type { Grade, Writer } from "../api/question";

// 질문 상세·답변에서 작성자 정보를 같은 모양으로 보여 주기 위한 값 (docs/api.md 작성자 정보)
export const GRADES: Record<Grade, { label: string; color: string }> = {
  BRONZE: { label: "브론즈", color: "#CD7F32" },
  SILVER: { label: "실버", color: "#9CA3AF" },
  GOLD: { label: "골드", color: "#EAB308" },
  PLATINUM: { label: "플래티넘", color: "#06B6D4" },
};

// 닉네임을 누르면 그 회원의 프로필로 이동한다 (REQ-QNA-004, REQ-ANSWER-010). 화면은 App.tsx의 /members/:memberId
export const profilePath = (memberId: number) => `/members/${memberId}`;

// "2026-11-12T10:00:00" → "2026.11.12"
export const formatDate = (dateTime: string) => dateTime.slice(0, 10).replaceAll("-", ".");

// 경력을 등록하지 않았으면 null (닉네임만 표시한다, REQ-QNA-004)
export function writerSummary({ careerYears, techStacks, grade, acceptRate }: Writer) {
  if (careerYears === null) return null;
  const career = careerYears === 0 ? "신입" : `${careerYears}년차`;
  return [
    career,
    ...(techStacks.length > 0 ? [techStacks.join(", ")] : []),
    GRADES[grade].label,
    `채택률 ${acceptRate}%`,
  ].join(" · ");
}
