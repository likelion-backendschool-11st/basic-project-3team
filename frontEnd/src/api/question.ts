import { api, type ApiResponse } from "./client";

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
