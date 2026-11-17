// 질문 상세 하단 유사 질문 영역 (#58, REQ-QUESTION-009). 디자인은 Answers(24번) 화면 하단 "이런 질문도 있어요".
// 쓰는 화면의 *.tailwind.cjs content에 components 폴더가 들어 있어야 스타일이 생긴다.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSimilarQuestions, type QuestionListItem } from "../api/question";
import { detailPath } from "./questionList";
import StatusBadge from "./StatusBadge";
import { CARD, FOCUS } from "./uiStyles";
import { formatNumber } from "./writer";

export default function SimilarQuestions({ questionId }: { questionId: number }) {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    setQuestions([]);
    getSimilarQuestions(questionId)
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      // 부가 기능이라 실패하면 영역을 숨긴다.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  // 후보가 없으면(불러오는 중·실패 포함) 영역을 숨긴다 (docs/api.md 4장).
  if (questions.length === 0) return null;

  return (
    <section className="space-y-3 pt-8" data-purpose="similar-questions-container">
      <h2 className="text-lg font-extrabold flex items-center gap-2 text-devin-ink">
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          info
        </span>
        이런 질문도 있어요
      </h2>
      <div className="space-y-2">
        {questions.map((question) => (
          <Link
            key={question.questionId}
            className={`${CARD} shadow-devin-sm block p-4 hover:bg-devin-bg transition-colors ${FOCUS}`}
            to={detailPath(question.questionId)}
          >
            <div className="flex items-center gap-3">
              <StatusBadge
                kind={question.accepted ? "accepted" : question.answerCount === 0 ? "waiting" : "unaccepted"}
              />
              <span className="text-sm font-bold text-devin-ink truncate">{question.title}</span>
              <span className="text-[11px] text-devin-gray ml-auto shrink-0 tabular-nums">
                답변 {formatNumber(question.answerCount)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
