// 질문 상세 하단 유사 질문 영역 (#58, REQ-QUESTION-009). 디자인은 Answers(24번) 화면 하단 "이런 질문도 있어요".
// 쓰는 화면의 *.tailwind.cjs content에 components 폴더가 들어 있어야 스타일이 생긴다.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSimilarQuestions, type QuestionListItem } from "../api/question";
import { detailPath } from "./questionList";

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
      <h3 className="text-base font-black flex items-center gap-2">
        <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <span>이런 질문도 있어요</span>
      </h3>
      <div className="space-y-2">
        {questions.map((question) => (
          <Link
            key={question.questionId}
            className="block bg-white hover:bg-amber-50/50 border-[2.5px] border-[#111111] rounded-lg p-3 shadow-[3px_3px_0_#111111] transition-transform hover:-translate-y-0.5"
            to={detailPath(question.questionId)}
          >
            <div className="flex items-center gap-3">
              {question.accepted ? (
                <span className="bg-[#DCFCE7] text-[#15803D] border border-emerald-600 text-xs font-black px-2 py-0.5 rounded shrink-0">
                  해결됨
                </span>
              ) : (
                <span className="bg-[#F1F5F9] text-[#64748B] border border-slate-400 text-xs font-black px-2 py-0.5 rounded shrink-0">
                  미해결
                </span>
              )}
              <span className="text-sm font-bold text-gray-900 hover:underline truncate">{question.title}</span>
              <span className="text-xs text-gray-400 font-medium ml-auto shrink-0">답변 {question.answerCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
