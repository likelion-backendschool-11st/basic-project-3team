import type { Grade, Profile } from "../api/mypage";

export const GRADE_LABEL: Record<Grade, string> = {
  BRONZE: "🥉 브론즈",
  SILVER: "🥈 실버",
  GOLD: "🥇 골드",
  PLATINUM: "💎 플래티넘",
};

// careerYears: null = 미등록, 0 = 신입 (docs/api.md 입력값 규칙)
export function formatCareer(careerYears: number | null) {
  if (careerYears === null) return null;
  return careerYears === 0 ? "신입" : `${careerYears}년차`;
}

// 채택률은 소수점 첫째 자리까지, 답변이 없으면 0% (REQ-MYPAGE-006)
export function formatRate(rate: number) {
  return `${rate.toFixed(1).replace(/\.0$/, "")}%`;
}

const TAG_COLORS = [
  "bg-amber-100 text-amber-900",
  "bg-emerald-100 text-emerald-900",
  "bg-sky-100 text-sky-900",
  "bg-rose-100 text-rose-900",
  "bg-violet-100 text-violet-900",
];

const EMPTY = <span className="font-medium text-neutral-400">미등록</span>;

// 프로필 항목 목록 (REQ-MYPAGE-001). 마이페이지와 다른 회원 프로필에서 함께 쓴다.
export default function ProfileDetails({ profile, showGrade = false }: { profile: Profile; showGrade?: boolean }) {
  const career = formatCareer(profile.careerYears);
  return (
    <dl className="space-y-3 text-sm" data-purpose="profile-details">
      <div className="flex items-center">
        <dt className="w-24 font-bold text-neutral-500 shrink-0">닉네임</dt>
        <dd className="font-extrabold text-neutral-900" data-field="nickname">
          {profile.nickname}
        </dd>
      </div>
      <div className="flex items-center">
        <dt className="w-24 font-bold text-neutral-500 shrink-0">경력</dt>
        <dd className="font-bold text-neutral-800" data-field="career">
          {career ?? EMPTY}
        </dd>
      </div>
      <div className="flex items-center">
        <dt className="w-24 font-bold text-neutral-500 shrink-0">기술 스택</dt>
        <dd className="flex flex-wrap gap-1.5" data-field="techStacks">
          {profile.techStacks.length === 0
            ? EMPTY
            : profile.techStacks.map((name, i) => (
                <span
                  className={`${TAG_COLORS[i % TAG_COLORS.length]} neo-border-thin text-xs font-bold px-2 py-0.5`}
                  key={name}
                >
                  {name}
                </span>
              ))}
        </dd>
      </div>
      <div className="flex items-start pt-1">
        <dt className="w-24 font-bold text-neutral-500 shrink-0">소개글</dt>
        <dd className="font-medium text-neutral-700 leading-snug whitespace-pre-line break-all" data-field="bio">
          {profile.bio ?? EMPTY}
        </dd>
      </div>
      {showGrade && (
        <>
          <div className="flex items-center">
            <dt className="w-24 font-bold text-neutral-500 shrink-0">등급</dt>
            <dd className="font-extrabold text-neutral-800" data-field="grade">
              {GRADE_LABEL[profile.grade]}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="w-24 font-bold text-neutral-500 shrink-0">채택률</dt>
            <dd className="font-black text-indigo-600" data-field="acceptRate">
              {formatRate(profile.acceptRate)}
            </dd>
          </div>
        </>
      )}
    </dl>
  );
}
