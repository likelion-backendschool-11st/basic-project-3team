import { useRef, type KeyboardEvent } from "react";
import { tabClass, tabCountClass } from "./uiStyles";
import { formatNumber } from "./writer";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  // 있으면 탭 이름 옆에 작은 숫자 상자로 보여 준다 ("내 답변 3")
  count?: number;
}

// 공통 탭 (docs/ui-guide.md 12절): 정렬(최신순·조회수순 등), 마이페이지 탭.
// 예: <SortTabs tabs={SORT_TABS} value={sort} onChange={setSort} label="정렬" />
// 좌우 화살표 키로 옆 탭으로 옮긴다.
export default function SortTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.value === value);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + step + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div
      ref={listRef}
      className="flex flex-wrap items-center gap-1.5"
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            className={tabClass(selected)}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {tab.count !== undefined && <span className={tabCountClass(selected)}>{formatNumber(tab.count)}</span>}
          </button>
        );
      })}
    </div>
  );
}
