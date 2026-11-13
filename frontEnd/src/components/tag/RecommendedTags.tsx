import { useEffect, useState } from "react";
import { recommendTags } from "../../api/tag";

interface Props {
  title: string;
  content: string;
  selected: string[];
  // 눌렀을 때: 안 고른 태그면 추가, 고른 태그면 제거 (REQ-QUESTION-008)
  onToggle: (name: string) => void;
}

const DEBOUNCE_MS = 600;

// 질문 등록·수정 화면용 추천 태그. 제목·내용을 고치면 잠시 뒤 POST /api/tags/recommend로 다시 받아 온다.
// 로그인이 필요한 API라 실패하면(비로그인 등) 영역을 숨긴다.
export default function RecommendedTags({ title, content, selected, onToggle }: Props) {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!title.trim() && !content.trim()) {
      setTags([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      recommendTags({ title, content })
        .then((list) => {
          if (!cancelled) setTags(list);
        })
        .catch(() => {
          if (!cancelled) setTags([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [title, content]);

  if (tags.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs" data-purpose="recommended-tags">
      <span className="font-bold text-gray-700">추천 태그</span>
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            className={`px-2 py-0.5 font-bold border-2 border-[#111111] transition-colors ${
              isSelected ? "bg-[#111111] text-white" : "bg-white hover:bg-[#FFD43B]"
            }`}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(tag)}
          >
            {isSelected ? "✓ " : "+ "}#{tag}
          </button>
        );
      })}
    </div>
  );
}
