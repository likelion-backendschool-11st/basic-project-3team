import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LoginPromptContext } from "../hooks/loginPromptContext";
import { buttonClass, CARD, FOCUS } from "./uiStyles";

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
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-devin-bg/60 backdrop-blur-sm"
          onClick={close}
        >
          {/* 확인 모달과 같은 카드 모양 (docs/ui-guide.md 6절). 로그인하기가 주요 버튼, 닫기는 보조 버튼.
              안내 팝업이라 아이콘·글자와 같이 버튼도 가운데에 둔다 (#213) */}
          <section
            aria-labelledby="login-prompt-title"
            aria-modal="true"
            className={`${CARD} w-full max-w-devin-narrow p-6 text-center`}
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="material-symbols-outlined mb-3 text-[40px] leading-none text-devin-ink" aria-hidden="true">
              lock
            </span>
            <h2 className="text-base font-extrabold mb-2" id="login-prompt-title">
              로그인이 필요해요
            </h2>
            <p className="text-sm text-devin-gray mb-6">{message}</p>
            <div className="flex justify-center gap-2">
              <button className={buttonClass("secondary")} type="button" onClick={close}>
                닫기
              </button>
              <Link autoFocus className={buttonClass("primary")} to="/login" onClick={close}>
                로그인하기
              </Link>
            </div>
            <p className="text-xs text-devin-gray mt-4">
              아직 회원이 아니신가요?{" "}
              <Link className={`font-bold text-devin-ink underline rounded ${FOCUS}`} to="/signup" onClick={close}>
                회원가입
              </Link>
            </p>
          </section>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
}
