import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { SearchScope } from "../../api/question";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { usePopularTags } from "../../hooks/useTagData";
import PopularTags from "../tag/PopularTags";
import { CHIP, FOCUS, INPUT, MENU, NOTICE } from "../uiStyles";
import { buildSearchUrl, MAX_KEYWORD_LENGTH, SCOPES, SEARCH_PATH } from "./searchCondition";

// 헤더 검색창 + 검색 드롭다운 (REQ-MAIN-009, REQ-SEARCH-001)
// 검색창을 누르면 검색 범위·최근 검색어 드롭다운이 열리고, 엔터나 검색 버튼으로 검색 결과 화면에 간다.
export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const recent = useRecentSearches();
  const popularTags = usePopularTags(6);
  const [text, setText] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [open, setOpen] = useState(false);
  const [emptyWarning, setEmptyWarning] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // 검색 결과 화면에서는 지금 검색어를 검색창에 보여준다.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const onSearchPage = location.pathname === SEARCH_PATH;
    const keyword = params.get("keyword");
    const tags = params.get("tags");
    setText(onSearchPage ? (keyword ?? (tags && !keyword ? `#${tags.split(",").join(" #")}` : "")) : "");
    setScope(onSearchPage && keyword ? (SCOPES.find((s) => s.value === params.get("scope"))?.value ?? "all") : "all");
    setOpen(false);
  }, [location.pathname, location.search]);

  // 드롭다운 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function search(input: string, searchScope: SearchScope) {
    const url = buildSearchUrl(input, searchScope);
    if (!url) {
      setEmptyWarning(true);
      return;
    }
    recent.add(input.trim());
    setOpen(false);
    navigate(url);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    search(text, scope);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") setOpen(false);
  }

  const isTagInput = text.trim().startsWith("#");

  // 드롭다운 한 줄: 휴대폰 폭에서는 이름을 위에, sm 이상에서는 왼쪽에 둔다.
  const row = "flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4";
  const rowLabel = "text-xs font-extrabold text-devin-ink sm:w-20 sm:pt-1.5 shrink-0";

  // #147: 휴대폰 폭에서는 Header가 펼친 한 줄을 꽉 채운다.
  return (
    <div className="relative flex-1 sm:max-w-devin-narrow sm:mx-6" ref={boxRef} onKeyDown={handleKeyDown}>
      <form className="relative flex items-center" role="search" onSubmit={handleSubmit}>
        <input
          className={`${INPUT.base} pr-12`}
          placeholder="검색어를 입력하세요"
          type="search"
          aria-label="질문 검색"
          aria-expanded={open}
          aria-controls="search-dropdown"
          maxLength={MAX_KEYWORD_LENGTH}
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setText(event.target.value);
            setEmptyWarning(false);
            setOpen(true);
          }}
        />
        <button
          className={`absolute right-1 inline-flex items-center justify-center w-8 h-8 rounded-lg text-devin-ink hover:bg-devin-yellow ${FOCUS}`}
          type="submit"
          aria-label="검색"
        >
          <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
            search
          </span>
        </button>
      </form>

      {open && (
        <div
          id="search-dropdown"
          className={`${MENU.panel} absolute left-0 top-12 w-full p-4 z-50 space-y-3 text-sm`}
          data-purpose="search-layer-popover"
        >
          {emptyWarning && (
            <p className={NOTICE.error} role="alert">
              <span className="material-symbols-outlined text-[18px] leading-5" aria-hidden="true">
                error
              </span>
              검색어를 입력해 주세요.
            </p>
          )}

          <fieldset className={row} disabled={isTagInput}>
            <legend className="sr-only">검색 범위</legend>
            <span className={rowLabel} aria-hidden="true">
              검색 범위
            </span>
            <div className={`flex items-center gap-4 flex-wrap ${isTagInput ? "opacity-[.45]" : ""}`}>
              {SCOPES.map((option) => (
                <label key={option.value} className="flex items-center gap-2 h-8 cursor-pointer font-medium">
                  <input
                    className={`w-4 h-4 text-devin-ink border-devin border-devin-ink focus:ring-0 focus:ring-offset-0 ${FOCUS}`}
                    name="search-scope"
                    type="radio"
                    value={option.value}
                    checked={scope === option.value}
                    onChange={() => setScope(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 인기 태그 (GET /api/tags/popular). 누르면 그 태그로 바로 검색한다. 불러오지 못하면 줄째 숨긴다. */}
          {popularTags.length > 0 && (
            <div className={row}>
              <span className={rowLabel}>인기 태그</span>
              <PopularTags limit={6} onSelect={(tag) => search(`#${tag}`, "all")} />
            </div>
          )}

          <div className={MENU.divider} role="separator" />

          <div className={row}>
            <span className={rowLabel}>최근 검색어</span>
            {recent.items.length === 0 ? (
              <span className="text-devin-gray sm:pt-1">최근 검색어가 없어요.</span>
            ) : (
              <ul className="flex items-center gap-2 flex-wrap" data-purpose="recent-keywords">
                {recent.items.map((item) => (
                  <li key={item} className={CHIP.removable}>
                    <button
                      className={`hover:underline rounded ${FOCUS}`}
                      type="button"
                      onClick={() => search(item, "all")}
                    >
                      {item}
                    </button>
                    <button
                      className={CHIP.remove}
                      type="button"
                      aria-label={`${item} 지우기`}
                      onClick={() => recent.remove(item)}
                    >
                      <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden="true">
                        close
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="flex items-center gap-1.5 pt-3 border-t border-devin-line text-xs text-devin-gray">
            <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden="true">
              info
            </span>
            #태그명으로 입력하면 태그 검색으로 바뀌어요 (예: #react #jpa)
          </p>
        </div>
      )}
    </div>
  );
}
