import type { Grade } from "../api/mypage";
import { GRADES } from "./gradeBadge";

// 등급 메달 (docs/ui-guide.md 7절): workspace_premium(채움) 하나에 등급 색.
// 닉네임 옆(답변, 답글, 작성자 팝오버)은 아이콘만 쓰고 이름은 title로,
// 마이페이지·프로필·등급 화면은 withLabel로 아이콘 + 이름("골드")을 보여 준다.
export default function GradeIcon({ grade, withLabel = false }: { grade: Grade; withLabel?: boolean }) {
  const { label, color } = GRADES[grade];
  const icon = (
    <span
      className="material-symbols-outlined text-[18px] leading-none"
      style={{ color, fontVariationSettings: "'FILL' 1" }}
      aria-hidden="true"
    >
      workspace_premium
    </span>
  );

  if (!withLabel) {
    return (
      <span className="inline-flex items-center" title={`${label} 등급`} role="img" aria-label={`${label} 등급`}>
        {icon}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-extrabold text-devin-ink whitespace-nowrap">
      {icon}
      {label}
    </span>
  );
}
