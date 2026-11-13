import type { QuestionSort } from "../api/question";

// 질문 목록 화면(메인, 검색 결과)이 함께 쓰는 값과 함수

export const PAGE_SIZE = 10;

export const SORT_TABS: { value: QuestionSort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회수순" },
  { value: "answers", label: "답변순" },
  { value: "likes", label: "좋아요순" },
];

export function parseSort(value: string | null): QuestionSort {
  return SORT_TABS.find((tab) => tab.value === value)?.value ?? "latest";
}

// URL의 page는 1부터 센다. API에 보낼 때 1을 뺀다.
export function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

// 상세 화면(#26)의 경로가 정해지면 여기만 바꾼다.
export function detailPath(questionId: number) {
  return `/question-detail?questionId=${questionId}`;
}

// 태그 하나로 검색하는 주소 (REQ-SEARCH-003: 질문에 달린 태그를 눌러도 검색)
export function tagSearchPath(tag: string) {
  return `/search-results?tags=${encodeURIComponent(tag)}`;
}

// "2026-11-08T10:00:00" → "2026.11.08"
export function formatDate(createdAt: string) {
  return createdAt.slice(0, 10).replaceAll("-", ".");
}

// 1234 → "1.2k"
export function formatCount(count: number) {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(count);
}
