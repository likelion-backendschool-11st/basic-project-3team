// 삭제·채택 이중 확인 창 (DeleteAcceptModal 화면의 삭제/채택 카드 디자인).
// 쓰는 화면의 *.tailwind.cjs content에 components 폴더가 들어 있어야 스타일이 생긴다.
const TONES = {
  danger: {
    dot: "bg-[#E11D48]",
    label: "Warning",
    message: "text-[#E11D48]",
    button: "bg-[#E11D48] hover:bg-[#BE123C]",
  },
  accept: { dot: "bg-[#16A34A]", label: "Accept", message: "text-gray-600", button: "bg-[#16A34A] hover:bg-[#15803D]" },
} as const;

export default function ConfirmModal({
  tone,
  title,
  message,
  confirmLabel,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  tone: keyof typeof TONES;
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const style = TONES[tone];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(255, 253, 245, 0.55)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="relative w-full max-w-md bg-white border-[2.5px] border-[#111111] rounded-[14px] shadow-[5px_5px_0_#111111] p-8 md:p-10">
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full border-[1.5px] border-black ${style.dot}`}></span>
          <span className="text-xs font-mono font-bold tracking-tight text-gray-500 uppercase">{style.label}</span>
        </div>
        <div className="pt-6 text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-[#111111]" id="confirm-modal-title">
            {title}
          </h2>
          <p className={`text-base font-bold ${style.message}`}>{message}</p>
        </div>
        {error && (
          <p
            className="mt-6 px-4 py-3 bg-white border-[2.5px] border-[#111111] rounded-xl text-sm font-bold text-center text-[#111111]"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="pt-8 flex items-center justify-center gap-4">
          <button
            autoFocus
            className="w-32 h-11 px-6 font-bold text-sm bg-white hover:bg-gray-100 text-[#111111] border-[2.5px] border-[#111111] rounded-lg shadow-[3px_3px_0_#111111]"
            type="button"
            onClick={onCancel}
          >
            {error ? "닫기" : "취소"}
          </button>
          <button
            className={`w-32 h-11 px-6 font-bold text-sm text-white border-[2.5px] border-[#111111] rounded-lg shadow-[3px_3px_0_#111111] disabled:opacity-60 disabled:cursor-not-allowed ${style.button}`}
            type="button"
            disabled={busy || error !== null}
            onClick={onConfirm}
          >
            {busy ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
