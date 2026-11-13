// 페이지 번호는 한 번에 이만큼만 보여준다 (‹ 1 2 3 4 5 ›).
const PAGE_WINDOW = 5;

function pageNumbers(current: number, totalPages: number) {
  const start = Math.max(1, Math.min(current - Math.floor(PAGE_WINDOW / 2), totalPages - PAGE_WINDOW + 1));
  const end = Math.min(totalPages, start + PAGE_WINDOW - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const buttonClass =
  "w-9 h-9 border-2 border-[#111111] text-sm font-bold shadow-[2px_2px_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

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
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="페이지 이동">
      <button
        className={`${buttonClass} bg-white disabled:opacity-40 disabled:shadow-none`}
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      {pageNumbers(page, totalPages).map((number) => (
        <button
          key={number}
          className={`${buttonClass} ${number === page ? "bg-[#FFD43B]" : "bg-white hover:bg-gray-100"}`}
          type="button"
          aria-current={number === page ? "page" : undefined}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}
      <button
        className={`${buttonClass} bg-white disabled:opacity-40 disabled:shadow-none`}
        type="button"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
