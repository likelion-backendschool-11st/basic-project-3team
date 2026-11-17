import { Link } from "react-router-dom";
import type { QuestionListItem as Question } from "../api/question";
import Highlight from "./Highlight";
import { detailPath, tagSearchPath } from "./questionList";
import StatusBadge from "./StatusBadge";
import { CATEGORY, FOCUS, TAG } from "./uiStyles";
import { formatDate, formatNumber } from "./writer";

interface Props {
  question: Question;
  // 검색 결과 화면에서 강조할 검색어 (제목·태그)
  highlightTitle?: string;
  highlightTag?: string;
  // 태그를 눌렀을 때. 없으면 그 태그로 검색 결과 화면을 연다.
  onTagClick?: (tag: string) => void;
}

const tagClass = `${TAG} ${FOCUS}`;

// 질문 목록 한 줄 (메인 화면, 검색 결과 화면). docs/ui-guide.md 7절: 상태는 제목 앞, 카테고리·태그는 제목 아래 줄.
// 수치(좋아요·답변·조회)는 sm 이상에서 왼쪽 열, 휴대폰 폭에서는 제목 아래 한 줄로 내린다 (13절).
export default function QuestionListItem({ question, highlightTitle, highlightTag, onTagClick }: Props) {
  const status = question.accepted ? "accepted" : question.answerCount === 0 ? "waiting" : "unaccepted";
  const counts = [
    { label: "좋아요", value: question.likeCount },
    { label: "답변", value: question.answerCount },
    { label: "조회", value: question.viewCount },
  ];

  return (
    <article className="p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:bg-devin-bg transition-colors">
      <dl className="order-2 sm:order-1 flex sm:flex-col gap-3 sm:gap-0.5 sm:w-16 shrink-0 text-[11px] text-devin-gray sm:text-center tabular-nums">
        {counts.map((count) => (
          <div key={count.label}>
            <dt className="inline">{count.label} </dt>
            <dd className="inline font-bold text-devin-ink">{formatNumber(count.value)}</dd>
          </div>
        ))}
      </dl>

      <div className="order-1 sm:order-2 flex-1 min-w-0 space-y-2">
        <div className="flex items-start gap-2">
          <StatusBadge kind={status} />
          <Link
            className={`text-base font-extrabold text-devin-ink leading-6 break-all hover:underline rounded ${FOCUS}`}
            to={detailPath(question.questionId)}
          >
            <Highlight text={question.title} keyword={highlightTitle} />
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={CATEGORY}>{question.category.name}</span>
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

        <p className="text-xs text-devin-gray">
          <span className="font-semibold text-devin-ink">{question.writer.nickname}</span>
          {` · ${formatDate(question.createdAt)}`}
        </p>
      </div>
    </article>
  );
}
