import { createContext } from "react";

// 비로그인 사용자가 로그인이 필요한 기능을 누르면 띄우는 안내 팝업을 연다. message는 팝업 본문 문구.
export type OpenLoginPrompt = (message: string) => void;

export const LoginPromptContext = createContext<OpenLoginPrompt | null>(null);
