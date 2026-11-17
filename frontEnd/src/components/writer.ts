import type { Writer } from "../api/question";
import { GRADES } from "./gradeBadge";

// 날짜·숫자 형식 (docs/ui-guide.md 10절). 화면에서는 이 함수로만 만든다.

// 목록 (질문, 내 활동, 관리자): "2026-11-08T10:00:00" → "2026.11.08"
export const formatDate = (dateTime: string) => dateTime.slice(0, 10).replaceAll("-", ".");

// 상세 (질문, 답변, 답글): "2026-11-12T10:00:00" → "2026.11.12 10:00" (#141: 날짜만 있으면 최신순이 헷갈린다)
export const formatDateTime = (dateTime: string) => dateTime.slice(0, 16).replace("T", " ").replaceAll("-", ".");

// 알림: "방금 전" / "5분 전" / "3시간 전", 하루가 지나면 "2026.11.12"
export function formatRelative(dateTime: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(dateTime).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return formatDate(dateTime);
}

// 숫자: 1024 → "1,024"
const NUMBER_FORMAT = new Intl.NumberFormat("ko-KR");
export const formatNumber = (value: number) => NUMBER_FORMAT.format(value);

// 비율: 33.333 → "33.3%" (소수 첫째 자리)
export const formatPercent = (rate: number) => `${rate.toFixed(1)}%`;

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
