import type { BadgeCode } from "../api/mypage";
import { BADGE_ICON } from "./gradeBadge";

const SIZE = {
  sm: "w-12 h-12 text-[22px]",
  lg: "w-16 h-16 text-[28px]",
};

// 획득 뱃지 (docs/ui-guide.md 7절): 원 안에 아이콘.
// 획득: 노랑 원 + 2px 검정 테두리 + 작은 그림자 / 아직: 흰 원 + 2px 회색 점선 + 회색 아이콘
export default function BadgeIcon({
  code,
  acquired,
  size = "sm",
}: {
  code: BadgeCode;
  acquired: boolean;
  size?: keyof typeof SIZE;
}) {
  const circle = acquired
    ? "bg-devin-yellow border-devin border-devin-ink shadow-devin-sm text-devin-ink"
    : "bg-devin-paper border-devin border-dashed border-devin-gray-light text-devin-gray-light";
  return (
    <span className={`${SIZE[size]} inline-flex items-center justify-center rounded-full shrink-0 ${circle}`}>
      <span className="material-symbols-outlined leading-none [font-size:inherit]" aria-hidden="true">
        {BADGE_ICON[code]}
      </span>
    </span>
  );
}
