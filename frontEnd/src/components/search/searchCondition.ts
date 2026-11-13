import type { QuestionSearchParams, QuestionSort, SearchScope } from "../../api/question";
import { PAGE_SIZE, parsePage, parseSort } from "../questionList";

export const SEARCH_PATH = "/search-results";
export const MAX_TAGS = 8;
export const MAX_KEYWORD_LENGTH = 100;

export const SCOPES: { value: SearchScope; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "title", label: "제목" },
  { value: "content", label: "내용" },
  { value: "tag", label: "태그" },
];

export type AcceptedFilter = "all" | "true" | "false";

export const ACCEPTED_OPTIONS: { value: AcceptedFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "true", label: "채택" },
  { value: "false", label: "미채택" },
];

// 검색 결과 화면의 조건. URL 쿼리와 1:1로 대응한다 (새로고침·뒤로 가기·페이지 이동에도 유지).
export interface SearchCondition {
  keyword: string;
  scope: SearchScope;
  categoryId: number | null;
  tags: string[];
  startDate: string;
  endDate: string;
  accepted: AcceptedFilter;
  sort: QuestionSort;
  page: number; // 1부터
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeTag(tag: string) {
  return tag.trim().replace(/^#/, "").toLowerCase();
}

export function parseTags(value: string | null): string[] {
  const tags = (value ?? "").split(",").map(normalizeTag).filter(Boolean);
  return [...new Set(tags)].slice(0, MAX_TAGS);
}

export function readCondition(params: URLSearchParams): SearchCondition {
  const scope = SCOPES.find((s) => s.value === params.get("scope"))?.value ?? "all";
  const categoryId = Number(params.get("categoryId"));
  const accepted = params.get("accepted");
  const date = (key: string) => {
    const value = params.get(key) ?? "";
    return DATE_PATTERN.test(value) ? value : "";
  };
  return {
    keyword: (params.get("keyword") ?? "").trim().slice(0, MAX_KEYWORD_LENGTH),
    scope,
    // 카테고리 목록은 API로 받으므로 여기서는 형식(1 이상 정수)만 본다. 없는 ID면 서버가 빈 결과를 준다.
    categoryId: Number.isSafeInteger(categoryId) && categoryId >= 1 ? categoryId : null,
    tags: parseTags(params.get("tags")),
    startDate: date("startDate"),
    endDate: date("endDate"),
    accepted: accepted === "true" || accepted === "false" ? accepted : "all",
    sort: parseSort(params.get("sort")),
    page: parsePage(params.get("page")),
  };
}

// 기본값인 조건은 주소에서 뺀다.
export function toSearchParams(condition: SearchCondition): URLSearchParams {
  const params = new URLSearchParams();
  if (condition.keyword) params.set("keyword", condition.keyword);
  if (condition.keyword && condition.scope !== "all") params.set("scope", condition.scope);
  if (condition.categoryId) params.set("categoryId", String(condition.categoryId));
  if (condition.tags.length > 0) params.set("tags", condition.tags.join(","));
  if (condition.startDate) params.set("startDate", condition.startDate);
  if (condition.endDate) params.set("endDate", condition.endDate);
  if (condition.accepted !== "all") params.set("accepted", condition.accepted);
  if (condition.sort !== "latest") params.set("sort", condition.sort);
  if (condition.page > 1) params.set("page", String(condition.page));
  return params;
}

export function toApiParams(condition: SearchCondition): QuestionSearchParams {
  return {
    keyword: condition.keyword || undefined,
    scope: condition.keyword ? condition.scope : undefined,
    categoryId: condition.categoryId ?? undefined,
    tags: condition.tags.length > 0 ? condition.tags.join(",") : undefined,
    startDate: condition.startDate || undefined,
    endDate: condition.endDate || undefined,
    accepted: condition.accepted === "all" ? undefined : condition.accepted === "true",
    sort: condition.sort,
    page: condition.page - 1,
    size: PAGE_SIZE,
  };
}

// 헤더 검색창 입력 → 검색 결과 주소. "#react"처럼 #으로 시작하면 태그 검색으로 바꾼다.
// 빈 값이면 null (REQ-SEARCH-001: 빈 값은 검색하지 않는다).
export function buildSearchUrl(input: string, scope: SearchScope): string | null {
  const text = input.trim();
  if (!text) return null;
  const params = new URLSearchParams();
  if (text.startsWith("#")) {
    const tags = parseTags(text.replaceAll(/\s+/g, ",").replaceAll("#", ""));
    if (tags.length === 0) return null;
    params.set("tags", tags.join(","));
  } else {
    params.set("keyword", text.slice(0, MAX_KEYWORD_LENGTH));
    if (scope !== "all") params.set("scope", scope);
  }
  return `${SEARCH_PATH}?${params}`;
}
