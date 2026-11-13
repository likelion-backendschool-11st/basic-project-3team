import { api, type ApiResponse } from "./client";

// docs/api.md 1장 페이징 응답 (page는 0부터 시작)
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type QuestionSort = "latest" | "views" | "answers" | "likes";

export interface QuestionListItem {
  questionId: number;
  title: string;
  writer: { memberId: number; nickname: string };
  category: { categoryId: number; name: string };
  tags: string[];
  accepted: boolean;
  likeCount: number;
  viewCount: number;
  answerCount: number;
  createdAt: string;
}

export interface QuestionListParams {
  page?: number;
  size?: number;
  sort?: QuestionSort;
}

// GET /api/questions — 메인 화면 질문 목록 (비로그인 가능)
export async function getQuestions(params: QuestionListParams): Promise<Page<QuestionListItem>> {
  const { data } = await api.get<ApiResponse<Page<QuestionListItem>>>("/questions", { params });
  return data.data;
}

export type SearchScope = "all" | "title" | "content" | "tag";

// docs/api.md 4장 검색 쿼리 파라미터. 값이 없는 조건은 보내지 않는다.
export interface QuestionSearchParams extends QuestionListParams {
  keyword?: string;
  scope?: SearchScope;
  categoryId?: number;
  tags?: string; // 쉼표로 구분 (spring,jpa)
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  accepted?: boolean;
}

// GET /api/questions/search — 검색 결과 화면 (비로그인 가능)
export async function searchQuestions(params: QuestionSearchParams): Promise<Page<QuestionListItem>> {
  const { data } = await api.get<ApiResponse<Page<QuestionListItem>>>("/questions/search", { params });
  return data.data;
}

// docs/api.md 1장 입력값 규칙 (질문). 서버 board.constants.js와 같은 값이다.
export const QUESTION_RULES = {
  titleMin: 5,
  titleMax: 100,
  contentMin: 10,
  contentMax: 10000,
  maxTags: 8,
} as const;

// shortcut: 카테고리 목록 API(GET /api/categories, #60)가 없어 seed.sql의 고정 7개를 그대로 둔다. #60이 나오면 API로 바꾼다.
export const CATEGORIES = [
  { categoryId: 1, name: "백엔드" },
  { categoryId: 2, name: "프론트엔드" },
  { categoryId: 3, name: "모바일" },
  { categoryId: 4, name: "데이터베이스" },
  { categoryId: 5, name: "DevOps·인프라" },
  { categoryId: 6, name: "AI·데이터" },
  { categoryId: 7, name: "기타" },
] as const;

export interface QuestionRequest {
  title: string;
  content: string;
  categoryId: number;
  tags: string[];
}

// POST /api/questions — 로그인 필요, 201 { questionId }
export async function createQuestion(request: QuestionRequest): Promise<{ questionId: number }> {
  const { data } = await api.post<ApiResponse<{ questionId: number }>>("/questions", request);
  return data.data;
}

export type Grade = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface QuestionDetail {
  questionId: number;
  title: string;
  content: string;
  category: { categoryId: number; name: string };
  tags: string[];
  writer: {
    memberId: number;
    nickname: string;
    careerYears: number | null;
    techStacks: string[];
    grade: Grade;
    acceptRate: number;
  };
  viewCount: number;
  likeCount: number;
  liked: boolean;
  answerCount: number;
  accepted: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /api/questions/{questionId} — 비로그인 가능, 조회할 때마다 조회수 +1
export async function getQuestion(questionId: number): Promise<QuestionDetail> {
  const { data } = await api.get<ApiResponse<QuestionDetail>>(`/questions/${questionId}`);
  return data.data;
}

// DELETE /api/questions/{questionId} — 작성자(채택된 답변 없을 때) 또는 관리자
export async function deleteQuestion(questionId: number): Promise<void> {
  await api.delete(`/questions/${questionId}`);
}
