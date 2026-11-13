import { usePopularTags } from "../../hooks/useTagData";

interface Props {
  onSelect: (name: string) => void;
  limit?: number;
  // 이미 고른 태그는 눌린 상태로 보여 준다.
  selected?: string[];
}

// 인기 태그 버튼 목록 (GET /api/tags/popular). 불러오지 못하면 아무것도 그리지 않는다.
export default function PopularTags({ onSelect, limit = 8, selected = [] }: Props) {
  const tags = usePopularTags(limit);
  if (tags.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap" data-purpose="popular-tags-list">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.name);
        return (
          <button
            key={tag.tagId}
            className={`px-2.5 py-1 text-xs font-semibold border border-black transition-colors ${
              isSelected ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"
            }`}
            type="button"
            aria-pressed={isSelected}
            title={`질문 ${tag.questionCount}개`}
            onClick={() => onSelect(tag.name)}
          >
            #{tag.name}
          </button>
        );
      })}
    </div>
  );
}
