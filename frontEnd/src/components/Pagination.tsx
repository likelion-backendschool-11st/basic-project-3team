import { BUTTON } from "./uiStyles";

// 페이지 번호는 한 번에 이만큼만 보여준다 (‹ 1 2 3 4 5 ›).
const PAGE_WINDOW = 5;

function pageNumbers(current: number, totalPages: number) {
  const start = Math.max(1, Math.min(current - Math.floor(PAGE_WINDOW / 2), totalPages - PAGE_WINDOW + 1));
  const end = Math.min(totalPages, start + PAGE_WINDOW - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// 작은 정사각 버튼 (ui-guide.md 4절 작게 32px). 지금 페이지는 검정 (탭·칩의 고른 상태와 같은 규칙, 12절).
const pageButton = `${BUTTON.base} w-8 h-8 px-0 text-sm tabular-nums`;
const ARROW = "material-symbols-outlined text-[18px] leading-none";

// page는 1부터 센다. 한 페이지뿐이면 표시하지 않는다.
export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-1.5 mt-6" aria-label="페이지 이동">
      <button
        className={`${pageButton} ${BUTTON.variant.secondary}`}
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <span className={ARROW} aria-hidden="true">
          chevron_left
        </span>
      </button>
      {pageNumbers(page, totalPages).map((number) => (
        <button
          key={number}
          className={`${pageButton} ${number === page ? "bg-devin-ink text-white" : BUTTON.variant.secondary}`}
          type="button"
          aria-current={number === page ? "page" : undefined}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}
      <button
        className={`${pageButton} ${BUTTON.variant.secondary}`}
        type="button"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span className={ARROW} aria-hidden="true">
          chevron_right
        </span>
      </button>
    </nav>
  );
}
