import type { QuestionSort } from "../api/question";
import { SORT_TABS } from "./questionList";

// 정렬 탭: 최신순 / 조회수순 / 답변순 / 좋아요순
export default function SortTabs({ value, onChange }: { value: QuestionSort; onChange: (sort: QuestionSort) => void }) {
  return (
    <div
      className="flex items-center border-[2.5px] border-[#111111] bg-white p-0.5 shadow-[2px_2px_0_#111111]"
      role="tablist"
      aria-label="정렬"
    >
      {SORT_TABS.map((tab) => (
        <button
          key={tab.value}
          className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
            tab.value === value ? "bg-[#111111] text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
