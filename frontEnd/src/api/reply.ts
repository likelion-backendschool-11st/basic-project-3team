import { api, type ApiResponse } from "./client";
import type { Writer } from "./question";

// docs/api.md 1장 입력값 규칙 (답글 content). 서버 reply.constants.js와 같은 값이다.
export const REPLY_CONTENT_MAX = 500;

export interface Reply {
  replyId: number;
  content: string;
  writer: Writer;
  createdAt: string;
  updatedAt: string;
}

// GET /api/answers/{answerId}/replies — 비로그인 가능, 오래된 순, 페이징 없음
export async function getReplies(answerId: number): Promise<Reply[]> {
  const { data } = await api.get<ApiResponse<Reply[]>>(`/answers/${answerId}/replies`);
  return data.data;
}

// POST /api/answers/{answerId}/replies — 회원, 채택된 답변에도 가능
export async function createReply(answerId: number, content: string): Promise<{ replyId: number }> {
  const { data } = await api.post<ApiResponse<{ replyId: number }>>(`/answers/${answerId}/replies`, { content });
  return data.data;
}

// PATCH /api/replies/{replyId} — 작성자만 (관리자도 수정 불가)
export async function updateReply(replyId: number, content: string): Promise<void> {
  await api.patch(`/replies/${replyId}`, { content });
}

// DELETE /api/replies/{replyId} — 작성자·관리자
export async function deleteReply(replyId: number): Promise<void> {
  await api.delete(`/replies/${replyId}`);
}
