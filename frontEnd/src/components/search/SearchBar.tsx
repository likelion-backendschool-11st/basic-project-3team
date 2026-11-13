import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { SearchScope } from "../../api/question";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { usePopularTags } from "../../hooks/useTagData";
import PopularTags from "../tag/PopularTags";
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

  return (
    <div className="relative flex-1 max-w-[460px] mx-2 sm:mx-6" ref={boxRef} onKeyDown={handleKeyDown}>
      <form className="relative flex items-center" role="search" onSubmit={handleSubmit}>
        <input
          className="w-full h-[40px] pl-3.5 pr-12 py-2 bg-white border-2 border-black rounded-[8px] text-sm text-[#111111] placeholder:text-[#888888] focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0_#111111] transition-all"
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
          className="absolute right-1.5 h-7 px-2 text-xs font-bold bg-[#111111] text-white rounded-[5px]"
          type="submit"
        >
          검색
        </button>
      </form>

      {open && (
        <div
          id="search-dropdown"
          className="absolute left-0 top-[46px] w-full bg-white border-2 border-black rounded-[8px] shadow-[4px_4px_0_#111111] p-5 z-50 text-sm"
          data-purpose="search-layer-popover"
        >
          {emptyWarning && <p className="mb-3 text-xs font-bold text-[#E11D48]">검색어를 입력해주세요.</p>}

          <fieldset className="flex items-center gap-6 pb-3" disabled={isTagInput}>
            <legend className="sr-only">검색 범위</legend>
            <span className="font-bold text-neutral-900 w-20 flex-shrink-0">검색 범위</span>
            <div className={`flex items-center gap-5 flex-wrap ${isTagInput ? "opacity-40" : ""}`}>
              {SCOPES.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800"
                >
                  <input
                    className="w-4 h-4 text-black border-2 border-black focus:ring-black focus:ring-offset-0 focus:ring-1"
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
            <div className="flex items-start gap-6 py-2">
              <span className="font-bold text-neutral-900 w-20 flex-shrink-0">인기 태그</span>
              <PopularTags limit={6} onSelect={(tag) => search(`#${tag}`, "all")} />
            </div>
          )}

          <div className="border-t border-neutral-200 my-3"></div>

          <div className="flex items-start gap-6 py-1">
            <span className="font-bold text-neutral-900 w-20 flex-shrink-0">최근 검색어</span>
            {recent.items.length === 0 ? (
              <span className="text-neutral-400">최근 검색어가 없습니다.</span>
            ) : (
              <ul
                className="flex items-center gap-x-4 gap-y-1 flex-wrap text-neutral-800"
                data-purpose="recent-keywords"
              >
                {recent.items.map((item) => (
                  <li key={item} className="flex items-center gap-1">
                    <button className="hover:underline font-mono" type="button" onClick={() => search(item, "all")}>
                      {item}
                    </button>
                    <button
                      className="text-neutral-400 hover:text-black font-bold p-0.5"
                      type="button"
                      aria-label={`${item} 삭제`}
                      onClick={() => recent.remove(item)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center text-xs text-neutral-500">
            <span className="text-neutral-400 mr-1.5 font-mono">ℹ</span>
            #태그명으로 입력하면 태그 검색으로 전환 (예: #react #jpa)
          </div>
        </div>
      )}
    </div>
  );
}
