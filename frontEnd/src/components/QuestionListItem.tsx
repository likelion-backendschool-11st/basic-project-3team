import { Link } from "react-router-dom";
import type { QuestionListItem as Question } from "../api/question";
import Highlight from "./Highlight";
import { detailPath, formatCount, formatDate, tagSearchPath } from "./questionList";

interface Props {
  question: Question;
  // 검색 결과 화면에서 강조할 검색어 (제목·태그)
  highlightTitle?: string;
  highlightTag?: string;
  // 태그를 눌렀을 때. 없으면 그 태그로 검색 결과 화면을 연다.
  onTagClick?: (tag: string) => void;
}

const tagClass =
  "px-2 py-0.5 border border-gray-400 text-gray-700 text-[11px] font-semibold bg-gray-50 hover:bg-[#FFD43B] hover:border-[#111111]";

// 질문 목록 한 줄 (메인 화면, 검색 결과 화면)
export default function QuestionListItem({ question, highlightTitle, highlightTag, onTagClick }: Props) {
  return (
    <article className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/40 transition-colors">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-16 flex-shrink-0 text-center text-xs leading-snug pt-0.5 font-medium text-gray-600">
          <div>
            {"좋아요 "}
            <span className="font-bold text-gray-900">{question.likeCount}</span>
          </div>
          <div>
            {"답변 "}
            <span className="font-bold text-gray-900">{question.answerCount}</span>
          </div>
          <div className="text-[11px] text-gray-400">조회 {formatCount(question.viewCount)}</div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {question.accepted ? (
              <span className="px-1.5 py-0.5 bg-[#C7F9CC] text-[#0B5D1E] border border-[#111111] text-xs font-bold">
                채택
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-gray-200 border border-gray-800 text-gray-800 text-xs font-bold">
                미채택
              </span>
            )}
            <Link
              className="font-bold text-base hover:underline text-gray-900 leading-tight break-all"
              to={detailPath(question.questionId)}
            >
              <Highlight text={question.title} keyword={highlightTitle} />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            <span className="px-2 py-0.5 border border-[#111111] text-[#111111] text-[11px] font-bold bg-[#FFD43B]">
              {question.category.name}
            </span>
            {question.tags.map((tag) =>
              onTagClick ? (
                <button key={tag} className={tagClass} type="button" onClick={() => onTagClick(tag)}>
                  <Highlight text={tag} keyword={highlightTag} />
                </button>
              ) : (
                <Link key={tag} className={tagClass} to={tagSearchPath(tag)}>
                  <Highlight text={tag} keyword={highlightTag} />
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 whitespace-nowrap self-end md:self-center font-medium">
        <span className="text-gray-900 font-semibold">{question.writer.nickname}</span>
        {` · ${formatDate(question.createdAt)}`}
      </div>
    </article>
  );
}
