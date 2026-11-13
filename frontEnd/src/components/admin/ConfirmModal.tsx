import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  // 없으면 "닫기" 버튼 하나만 보여 준다 (상세 보기용).
  confirmLabel?: string;
  // 삭제·정지처럼 되돌리기 어려운 동작이면 빨간 버튼
  danger?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm?: () => void;
  onClose: () => void;
}

// 삭제·반려·정지 확인 모달, 신고 상세 보기 (Stitch "회원 추방 모달 (13번)" 스타일). Esc나 바깥을 누르면 닫는다.
export default function ConfirmModal({
  title,
  children,
  confirmLabel,
  danger,
  busy,
  error,
  onConfirm,
  onClose,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 열릴 때 한 번만 취소(닫기) 버튼에 포커스를 둔다.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(255, 253, 245, 0.6)", backdropFilter: "blur(6px)" }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-lg bg-white p-6 sm:p-7"
        style={{ border: "2.5px solid #111111", borderRadius: "14px", boxShadow: "#111111 8px 8px 0px" }}
      >
        <h2 id="confirm-modal-title" className="mb-4 text-xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="mb-5 text-sm text-gray-800 leading-relaxed">{children}</div>
        {error && <p className="mb-4 text-sm font-bold text-[#E11D48]">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            className="h-10 px-5 bg-white border-2 border-[#111111] rounded-[8px] text-sm font-bold shadow-[2px_2px_0_#111111] hover:bg-gray-50 disabled:opacity-50"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            {onConfirm ? "취소" : "닫기"}
          </button>
          {onConfirm && (
            <button
              className={`h-10 px-5 border-2 border-[#111111] rounded-[8px] text-sm font-bold shadow-[2px_2px_0_#111111] disabled:opacity-50 ${
                danger ? "bg-[#E11D48] text-white hover:bg-red-700" : "bg-[#FFD43B] hover:bg-yellow-400"
              }`}
              type="button"
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? "처리 중..." : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
