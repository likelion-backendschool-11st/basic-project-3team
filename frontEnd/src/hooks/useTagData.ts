import { useEffect, useState } from "react";
import { CATEGORIES } from "../api/question";
import { getCategories, getPopularTags, type Category, type PopularTag } from "../api/tag";

// 카테고리·인기 태그는 자주 바뀌지 않아서 앱이 켜져 있는 동안 한 번만 불러와 함께 쓴다.
// 실패하면 다음에 다시 부를 수 있게 캐시를 비운다.
let categoriesPromise: Promise<Category[]> | null = null;
let popularPromise: Promise<PopularTag[]> | null = null;

function loadCategories() {
  categoriesPromise ??= getCategories().catch((error: unknown) => {
    categoriesPromise = null;
    throw error;
  });
  return categoriesPromise;
}

function loadPopularTags() {
  popularPromise ??= getPopularTags().catch((error: unknown) => {
    popularPromise = null;
    throw error;
  });
  return popularPromise;
}

// 카테고리 목록. 불러오기 전·실패 시에는 seed와 같은 고정 목록(CATEGORIES)을 보여 준다.
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([...CATEGORIES]);
  useEffect(() => {
    let cancelled = false;
    loadCategories()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        // 고정 목록을 그대로 쓴다.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return categories;
}

// 인기 태그. 불러오기 전·실패 시에는 빈 배열 (인기 태그 영역을 숨긴다).
export function usePopularTags(limit = 10): PopularTag[] {
  const [tags, setTags] = useState<PopularTag[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadPopularTags()
      .then((list) => {
        if (!cancelled) setTags(list);
      })
      .catch(() => {
        // 인기 태그 없이 동작한다.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return tags.slice(0, limit);
}
