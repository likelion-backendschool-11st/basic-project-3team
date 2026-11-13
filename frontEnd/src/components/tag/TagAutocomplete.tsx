import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { getTags, type Tag } from "../../api/tag";

interface Props {
  // 이미 고른 태그 (추천 목록에서 뺀다)
  selected: string[];
  onSelect: (name: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const DEBOUNCE_MS = 200;
const MAX_SUGGESTIONS = 8;

// 태그 입력 + 자동완성 (REQ-SEARCH-003, REQ-QUESTION-008)
// 태그는 seed.sql 목록에서만 고를 수 있어서(docs/api.md 10장), 입력한 글자로 GET /api/tags를 찾아 보여 준다.
// ↑↓로 고르고 Enter로 추가. 목록에 정확히 같은 이름이 있으면 그대로 Enter해도 추가된다.
export default function TagAutocomplete({ selected, onSelect, disabled, placeholder, className }: Props) {
  const listId = useId();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const keyword = input.trim().replace(/^#/, "").toLowerCase();

  useEffect(() => {
    if (!keyword) {
      setSuggestions([]);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      getTags(keyword)
        .then((tags) => {
          if (cancelled) return;
          const list = tags.filter((t) => !selected.includes(t.name.toLowerCase())).slice(0, MAX_SUGGESTIONS);
          setSuggestions(list);
          setActive(0);
          setNotFound(tags.length === 0);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword, selected]);

  // 바깥을 누르면 목록을 닫는다.
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function choose(name: string) {
    onSelect(name.toLowerCase());
    setInput("");
    setSuggestions([]);
    setNotFound(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const exact = suggestions.find((t) => t.name.toLowerCase() === keyword);
      const picked = open && suggestions[active] ? suggestions[active] : exact;
      if (picked) choose(picked.name);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && keyword !== "" && (suggestions.length > 0 || notFound);

  return (
    <div className={`relative ${className ?? ""}`} ref={boxRef}>
      <input
        className="h-8 w-48 px-2.5 text-xs border-2 border-[#111111] focus:outline-none focus:shadow-[2px_2px_0_#111111] disabled:opacity-40"
        placeholder={placeholder ?? "태그 검색"}
        aria-label="태그 검색"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && suggestions[active] ? `${listId}-${active}` : undefined}
        maxLength={30}
        disabled={disabled}
        value={input}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setInput(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 top-9 z-30 w-48 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-xs"
        >
          {suggestions.map((tag, index) => (
            <li
              key={tag.tagId}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={`px-2.5 py-1.5 font-bold cursor-pointer ${index === active ? "bg-[#FFD43B]" : "hover:bg-gray-100"}`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(tag.name)}
            >
              #{tag.name}
            </li>
          ))}
          {notFound && suggestions.length === 0 && (
            <li className="px-2.5 py-1.5 text-gray-500">일치하는 태그가 없습니다.</li>
          )}
        </ul>
      )}
    </div>
  );
}
