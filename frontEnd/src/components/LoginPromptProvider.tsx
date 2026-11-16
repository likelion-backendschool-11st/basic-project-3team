import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LoginPromptContext } from "../hooks/loginPromptContext";

// 비로그인 사용자가 질문하기·좋아요·신고 등을 누르면 로그인 화면으로 바로 보내지 않고 안내 팝업을 띄운다 (REQ-HEADER-002).
// 닫기를 누르면 보던 화면에 그대로 남는다. BrowserRouter 안에 둔다.
export default function LoginPromptProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const close = useCallback(() => setMessage(null), []);

  useEffect(() => {
    if (message === null) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [message, close]);

  return (
    <LoginPromptContext.Provider value={setMessage}>
      {children}
      {message !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-[8px]"
          style={{ backgroundColor: "rgba(255, 253, 245, 0.55)" }}
          onClick={close}
        >
          <section
            aria-labelledby="login-prompt-title"
            aria-modal="true"
            className="w-full max-w-sm bg-white border-[2.5px] border-black rounded-2xl shadow-[6px_6px_0_#000] p-8 text-center"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-[#FFD43B] border-[2.5px] border-black mx-auto mb-5 flex items-center justify-center text-2xl">
              🔒
            </div>
            <h2 className="text-xl font-black mb-2" id="login-prompt-title">
              로그인이 필요해요
            </h2>
            <p className="text-sm text-gray-600 font-medium mb-6">{message}</p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 bg-white border-[2.5px] border-black rounded-lg font-extrabold text-sm shadow-[2px_2px_0_#000] hover:bg-gray-100"
                type="button"
                onClick={close}
              >
                닫기
              </button>
              <Link
                autoFocus
                className="flex-1 py-2.5 bg-[#2563EB] text-white border-[2.5px] border-black rounded-lg font-extrabold text-sm shadow-[2px_2px_0_#000] hover:bg-blue-700"
                to="/login"
                onClick={close}
              >
                로그인하기
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              아직 회원이 아니신가요?{" "}
              <Link className="font-bold text-black underline" to="/signup" onClick={close}>
                회원가입
              </Link>
            </p>
          </section>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
}
