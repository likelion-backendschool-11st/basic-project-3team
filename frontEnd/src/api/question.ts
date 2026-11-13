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
