import { useContext } from "react";
import { LoginPromptContext } from "./loginPromptContext";

// 로그인 안내 팝업을 여는 함수를 꺼낸다. LoginPromptProvider 안에서만 쓸 수 있다.
export function useLoginPrompt() {
  const value = useContext(LoginPromptContext);
  if (!value) {
    throw new Error("useLoginPrompt는 LoginPromptProvider 안에서만 사용할 수 있습니다.");
  }
  return value;
}
