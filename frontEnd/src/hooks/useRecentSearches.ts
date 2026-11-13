import { useCallback, useState } from "react";

// 최근 검색어는 이 브라우저에만 남는 편의 기능이라 localStorage에 둔다.
// 저장이 막힌 환경(사생활 보호 모드 등)에서는 목록 없이 동작한다.
const STORAGE_KEY = "devin.recentSearches";
const MAX_RECENT = 5;

function load(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function save(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 저장하지 못해도 검색은 그대로 된다.
  }
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>(load);

  const update = useCallback((next: (prev: string[]) => string[]) => {
    setItems((prev) => {
      const result = next(prev);
      save(result);
      return result;
    });
  }, []);

  const add = useCallback(
    (text: string) => update((prev) => [text, ...prev.filter((item) => item !== text)].slice(0, MAX_RECENT)),
    [update],
  );
  const remove = useCallback((text: string) => update((prev) => prev.filter((item) => item !== text)), [update]);

  return { items, add, remove };
}
