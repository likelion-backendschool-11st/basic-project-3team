import { useEffect, useRef, type ReactNode } from "react";
import { buttonClass, CARD, NOTICE, type ButtonVariant } from "./uiStyles";

// 확인 버튼 색 (docs/ui-guide.md 4·6절): 되돌릴 수 없는 동작은 danger, 채택은 accent, 나머지는 primary
type Tone = Exclude<ButtonVariant, "secondary">;

interface Props {
  title: string;
  // 한 줄 설명. 더 많은 내용(대상 정보, 신고 상세 등)은 children으로 넣는다.
  message?: string;
  children?: ReactNode;
  // 없으면 "닫기" 버튼 하나만 보여 준다 (상세 보기용)
  confirmLabel?: string;
  onConfirm?: () => void;
  tone?: Tone;
  busy?: boolean;
  error?: string | null;
  // 오류 뒤에도 확인 버튼을 다시 누를 수 있게 한다 (관리자 처리처럼 다시 시도해도 되는 동작).
  // 기본은 오류가 나면 확인 버튼을 막고 취소 버튼을 "닫기"로 바꾼다 (그사이 삭제·채택된 경우).
  retryable?: boolean;
  onCancel: () => void;
}

// 확인 모달 (docs/ui-guide.md 6절): 카드 모양, 오른쪽 아래 [취소] [확인]. Esc나 바깥을 누르면 닫는다.
// 쓰는 화면의 *.tailwind.cjs content에 components/**/*.{ts,tsx}가 들어 있어야 스타일이 생긴다.
export default function ConfirmModal({
  title,
  message,
  children,
  confirmLabel,
  onConfirm,
  tone = "primary",
  busy = false,
  error = null,
  retryable = false,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const blocked = error !== null && !retryable;

  // 열릴 때 한 번만 취소(닫기) 버튼에 포커스를 둔다.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [busy, onCancel]);

  const showConfirm = onConfirm !== undefined && confirmLabel !== undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devin-bg/60 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className={`${CARD} w-full max-w-devin-narrow p-6`}
      >
        <h2 id="confirm-modal-title" className="text-base font-extrabold text-devin-ink">
          {title}
        </h2>
        {message && <p className="mt-2 text-sm text-devin-gray">{message}</p>}
        {children && <div className="mt-4 text-sm text-devin-ink leading-relaxed">{children}</div>}
        {error && (
          <p className={`${NOTICE.error} mt-4`} role="alert">
            <span className="material-symbols-outlined text-[18px] leading-5" aria-hidden="true">
              error
            </span>
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} className={buttonClass("secondary")} type="button" disabled={busy} onClick={onCancel}>
            {showConfirm && !blocked ? "취소" : "닫기"}
          </button>
          {showConfirm && (
            <button className={buttonClass(tone)} type="button" disabled={busy || blocked} onClick={onConfirm}>
              {busy ? "처리 중..." : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
