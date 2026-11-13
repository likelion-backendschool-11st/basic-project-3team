import { api, type ApiResponse } from "./client";

export type LikeTarget = "QUESTION" | "ANSWER";
export interface LikeState {
  liked: boolean;
  likeCount: number;
}

const PATHS: Record<LikeTarget, (id: number) => string> = {
  QUESTION: (id) => `/questions/${id}/likes`,
  ANSWER: (id) => `/answers/${id}/likes`,
};

// POST·DELETE /api/questions/{id}/likes, /api/answers/{id}/likes — 회원. 응답 { liked, likeCount } (docs/api.md 7장)
// 본인 글 400 CANNOT_LIKE_OWN_POST, 이미 좋아요 409 ALREADY_LIKED, 좋아요 안 한 대상 취소 404 LIKE_NOT_FOUND
export async function setLike(target: LikeTarget, id: number, like: boolean): Promise<LikeState> {
  const path = PATHS[target](id);
  const { data } = like ? await api.post<ApiResponse<LikeState>>(path) : await api.delete<ApiResponse<LikeState>>(path);
  return data.data;
}
