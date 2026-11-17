// 질문·답변 신고 창 (#26, REQ-QUESTION-011, REQ-ANSWER-008). 모양은 docs/ui-guide.md 6절(모달)을 따른다.
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
import { BUTTON, buttonClass, CARD, FOCUS, INPUT, NOTICE } from "../uiStyles";

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
      setResult("신고를 접수했어요.");
    } catch (err) {
      if (getErrorCode(err) === "ALREADY_REPORTED") {
        setResult("이미 신고한 글이에요.");
      } else {
        // 본인 글 400, 삭제된 글 404, 정지 회원 403 등 서버가 알려준 이유
        setError(getFieldErrors(err)[0]?.reason ?? getErrorMessage(err));
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devin-bg/60 backdrop-blur-sm">
      {result !== null ? (
        <div aria-live="polite" className={`${NOTICE.info} w-full max-w-devin-narrow shadow-devin`} role="status">
          <span className="material-symbols-outlined text-[18px] leading-5" aria-hidden="true">
            info
          </span>
          {result}
        </div>
      ) : (
        <div
          aria-labelledby="report-modal-title"
          aria-modal="true"
          className={`${CARD} w-full max-w-devin-narrow p-6`}
          role="dialog"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-devin-ink" id="report-modal-title">
              {TITLES[targetType]}
            </h2>
            <button aria-label="닫기" className={BUTTON.text} type="button" onClick={onClose}>
              <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
                close
              </span>
            </button>
          </div>
          <p className="mt-2 text-sm text-devin-gray">신고 사유를 골라 주세요.</p>

          <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
            <fieldset className="space-y-3">
              <legend className="sr-only">신고 사유 목록</legend>
              {REPORT_REASONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer py-0.5 select-none">
                  <input
                    checked={reason === value}
                    className={`w-4 h-4 accent-devin-ink cursor-pointer ${FOCUS}`}
                    name="reportReason"
                    type="radio"
                    value={value}
                    onChange={() => {
                      setReason(value);
                      setError(null);
                    }}
                  />
                  <span className="text-sm font-medium text-devin-ink">{label}</span>
                </label>
              ))}
            </fieldset>

            <div>
              <textarea
                aria-label="기타 사유"
                className={`${INPUT.box} resize-none`}
                disabled={!isEtc}
                placeholder="기타를 고르면 사유를 적을 수 있어요"
                rows={3}
                value={detail}
                onChange={(e) => {
                  setDetail(e.target.value);
                  setError(null);
                }}
              />
              {isEtc && (
                <p
                  className={`mt-1 text-right text-xs font-mono tabular-nums ${detailLength > REASON_DETAIL_MAX ? "text-devin-red" : "text-devin-gray"}`}
                >
                  {detailLength} / {REASON_DETAIL_MAX}
                </p>
              )}
            </div>

            {error && (
              <p className={NOTICE.error} role="alert">
                <span className="material-symbols-outlined text-[18px] leading-5" aria-hidden="true">
                  error
                </span>
                {error}
              </p>
            )}

            {/* 모달 버튼은 오른쪽 아래 [취소] [확인], 되돌릴 수 없는 신고는 위험 버튼 (ui-guide.md 6절) */}
            <div className="pt-2 flex justify-end gap-2">
              <button className={buttonClass("secondary")} type="button" onClick={onClose}>
                취소
              </button>
              <button className={buttonClass("danger")} disabled={!canSubmit || submitting} type="submit">
                {submitting ? "신고 중..." : "신고하기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
