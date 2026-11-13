import { api, type ApiResponse } from "./client";

export interface Tag {
  tagId: number;
  name: string;
}

export interface PopularTag extends Tag {
  questionCount: number;
}

export interface Category {
  categoryId: number;
  name: string;
}

// GET /api/tags?keyword= — keyword가 있으면 이름 부분 일치, 이름순
export async function getTags(keyword?: string): Promise<Tag[]> {
  const { data } = await api.get<ApiResponse<Tag[]>>("/tags", { params: { keyword: keyword || undefined } });
  return data.data;
}

// GET /api/tags/popular?limit= — 질문에 많이 달린 태그 순
export async function getPopularTags(limit?: number): Promise<PopularTag[]> {
  const { data } = await api.get<ApiResponse<PopularTag[]>>("/tags/popular", { params: { limit } });
  return data.data;
}

// POST /api/tags/recommend — 로그인 필요. 제목·내용에 나온 태그를 최대 8개 추천
export async function recommendTags(request: { title: string; content: string }): Promise<string[]> {
  const { data } = await api.post<ApiResponse<{ tags: string[] }>>("/tags/recommend", request);
  return data.data.tags;
}

// GET /api/categories — seed.sql의 고정 목록 (정렬 순서대로)
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data.data;
}
