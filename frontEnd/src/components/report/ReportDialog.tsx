// 질문·답변 신고 창 (#26, REQ-QUESTION-011, REQ-ANSWER-008). 디자인은 ReportModal(28번) 화면을 따른다.
// 쓰는 화면의 *.tailwind.cjs content에 components 폴더가 들어 있어야 스타일이 생긴다.
import { useEffect, useState, type FormEvent } from "react";
import { getErrorCode, getErrorMessage, getFieldErrors } from "../../api/client";
import {
  REASON_DETAIL_MAX,
  REPORT_REASONS,
  createReport,
  type ReportReason,
  type ReportTargetType,
} from "../../api/report";
import { charLength } from "../../hooks/useQuestionForm";

const TITLES: Record<ReportTargetType, string> = { QUESTION: "질문 신고", ANSWER: "답변 신고" };
const RESULT_SHOW_MS = 1800;

export default function ReportDialog({
  targetType,
  targetId,
  onClose,
}: {
  targetType: ReportTargetType;
  targetId: number;
  onClose: () => void;
}) {
  // 잘못 신고하지 않도록 처음에는 아무 사유도 고르지 않는다.
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 신고 접수·중복 신고 안내. 잠깐 보여 준 뒤 창을 닫는다.
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (result === null) return;
    const timer = setTimeout(onClose, RESULT_SHOW_MS);
    return () => clearTimeout(timer);
  }, [result, onClose]);

  const isEtc = reason === "ETC";
  const detailLength = charLength(detail.trim());
  const canSubmit = reason !== null && (!isEtc || (detailLength > 0 && detailLength <= REASON_DETAIL_MAX));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (reason === null || !canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createReport({ targetType, targetId, reason, ...(isEtc && { reasonDetail: detail.trim() }) });
      setResult("신고가 접수되었습니다.");
    } catch (err) {
      if (getErrorCode(err) === "ALREADY_REPORTED") {
        setResult("이미 신고한 글입니다");
      } else {
        // 본인 글 400, 삭제된 글 404, 정지 회원 403 등 서버가 알려준 이유
        setError(getFieldErrors(err)[0]?.reason ?? getErrorMessage(err));
        setSubmitting(false);
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(255, 253, 245, 0.55)", backdropFilter: "blur(8px)" }}
    >
      {result !== null ? (
        <div
          aria-live="polite"
          className="w-full max-w-sm px-6 py-3 bg-[#FFFDF9] border-[2.5px] border-black rounded-xl shadow-[4px_4px_0px_#111827] flex items-center justify-center gap-2.5 text-center"
          role="status"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-xs font-black">
            !
          </span>
          <span className="text-sm font-bold text-black tracking-tight">{result}</span>
        </div>
      ) : (
        <div
          aria-labelledby="report-modal-title"
          aria-modal="true"
          className="w-full max-w-[440px] bg-[#FFFDF9] border-[2.5px] border-black rounded-[14px] shadow-[8px_8px_0px_#111827] overflow-hidden"
          role="dialog"
        >
          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <h2 className="text-[20px] font-[800] text-black tracking-tight" id="report-modal-title">
              {TITLES[targetType]}
            </h2>
            <button
              aria-label="닫기"
              className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-transparent hover:border-black hover:bg-black/5 text-xl font-bold leading-none text-black"
              type="button"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="px-6 pt-1 pb-4">
            <p className="text-sm font-semibold text-gray-700">신고 사유를 선택해주세요</p>
          </div>

          <form className="px-6 pb-6 space-y-4" noValidate onSubmit={handleSubmit}>
            <fieldset className="space-y-3">
              <legend className="sr-only">신고 사유 목록</legend>
              {REPORT_REASONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group py-0.5 select-none">
                  <input
                    checked={reason === value}
                    className="w-4 h-4 accent-black cursor-pointer"
                    name="reportReason"
                    type="radio"
                    value={value}
                    onChange={() => {
                      setReason(value);
                      setError(null);
                    }}
                  />
                  <span className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="pt-2">
              <textarea
                aria-label="기타 사유"
                className="w-full text-sm font-normal p-3 rounded-lg border-[2px] border-black bg-gray-100 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus:border-black resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                disabled={!isEtc}
                placeholder="기타 사유를 입력하세요 (기타 선택 시 활성화)"
                rows={3}
                value={detail}
                onChange={(e) => {
                  setDetail(e.target.value);
                  setError(null);
                }}
              />
              {isEtc && (
                <p
                  className={`mt-1 text-right text-xs font-mono ${detailLength > REASON_DETAIL_MAX ? "text-red-600" : "text-gray-500"}`}
                >
                  {detailLength} / {REASON_DETAIL_MAX}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm font-bold text-[#E11D48]" role="alert">
                {error}
              </p>
            )}

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                className="w-32 py-2.5 px-5 bg-white text-black font-bold text-sm border-[2.5px] border-black rounded-lg shadow-[3px_3px_0px_#111827] text-center"
                type="button"
                onClick={onClose}
              >
                취소
              </button>
              <button
                className="w-32 py-2.5 px-5 bg-[#E11D48] text-white font-bold text-sm border-[2.5px] border-black rounded-lg shadow-[3px_3px_0px_#111827] hover:bg-[#d0153f] text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSubmit || submitting}
                type="submit"
              >
                {submitting ? "신고 중..." : "신고하기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
