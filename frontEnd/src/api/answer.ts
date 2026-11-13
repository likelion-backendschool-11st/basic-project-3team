import { api, type ApiResponse } from "./client";
import type { Writer } from "./question";

// docs/api.md 1장 입력값 규칙 (답변 content). 서버 answer.constants.js와 같은 값이다.
export const ANSWER_RULES = { contentMin: 10, contentMax: 10000 } as const;

export interface Answer {
  answerId: number;
  content: string;
  writer: Writer;
  likeCount: number;
  liked: boolean;
  accepted: boolean;
  acceptedAt: string | null;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

// GET /api/questions/{questionId}/answers — 비로그인 가능, 채택 → 좋아요순 → 최신순, 페이징 없음
export async function getAnswers(questionId: number): Promise<{ answerCount: number; answers: Answer[] }> {
  const { data } = await api.get<ApiResponse<{ answerCount: number; answers: Answer[] }>>(
    `/questions/${questionId}/answers`,
  );
  return data.data;
}

// POST /api/questions/{questionId}/answers — 회원
export async function createAnswer(questionId: number, content: string): Promise<{ answerId: number }> {
  const { data } = await api.post<ApiResponse<{ answerId: number }>>(`/questions/${questionId}/answers`, { content });
  return data.data;
}

// PATCH /api/answers/{answerId} — 작성자만, 채택된 답변은 409
export async function updateAnswer(answerId: number, content: string): Promise<void> {
  await api.patch(`/answers/${answerId}`, { content });
}

// DELETE /api/answers/{answerId} — 작성자(채택 전) 또는 관리자
export async function deleteAnswer(answerId: number): Promise<void> {
  await api.delete(`/answers/${answerId}`);
}

// POST /api/answers/{answerId}/accept — 질문 작성자만, 본인 답변 불가, 질문당 1개
export async function acceptAnswer(answerId: number): Promise<void> {
  await api.post(`/answers/${answerId}/accept`);
}
