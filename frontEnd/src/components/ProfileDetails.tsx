import { Link } from "react-router-dom";
import type { Profile } from "../api/mypage";
import GradeIcon from "./GradeIcon";
import { tagSearchPath } from "./questionList";
import { FOCUS, TAG } from "./uiStyles";
import { formatPercent } from "./writer";

// careerYears: null = 미등록, 0 = 신입 (docs/api.md 입력값 규칙)
export function formatCareer(careerYears: number | null) {
  if (careerYears === null) return null;
  return careerYears === 0 ? "신입" : `${careerYears}년차`;
}

const EMPTY = <span className="text-devin-gray-light">미등록</span>;
const ROW = "flex items-center";
const LABEL = "w-24 font-bold text-devin-gray shrink-0";

// 프로필 항목 목록 (REQ-MYPAGE-001). 색·태그는 docs/ui-guide.md 공통 값을 쓴다 (#190).
export default function ProfileDetails({ profile, showGrade = false }: { profile: Profile; showGrade?: boolean }) {
  const career = formatCareer(profile.careerYears);
  return (
    <dl className="space-y-3 text-sm text-devin-ink" data-purpose="profile-details">
      <div className={ROW}>
        <dt className={LABEL}>닉네임</dt>
        <dd className="font-extrabold" data-field="nickname">
          {profile.nickname}
        </dd>
      </div>
      <div className={ROW}>
        <dt className={LABEL}>경력</dt>
        <dd className="font-bold" data-field="career">
          {career ?? EMPTY}
        </dd>
      </div>
      <div className="flex items-start">
        <dt className={`${LABEL} leading-[22px]`}>기술 스택</dt>
        <dd className="flex flex-wrap gap-1.5" data-field="techStacks">
          {profile.techStacks.length === 0
            ? EMPTY
            : profile.techStacks.map((name) => (
                // 태그는 누르면 그 태그로 검색한다 (ui-guide.md 7절)
                <Link className={`${TAG} ${FOCUS}`} key={name} to={tagSearchPath(name)}>
                  {name}
                </Link>
              ))}
        </dd>
      </div>
      <div className="flex items-start">
        <dt className={LABEL}>소개글</dt>
        <dd className="leading-snug whitespace-pre-line break-all" data-field="bio">
          {profile.bio ?? EMPTY}
        </dd>
      </div>
      {showGrade && (
        <>
          <div className={ROW}>
            <dt className={LABEL}>등급</dt>
            <dd data-field="grade">
              <GradeIcon grade={profile.grade} withLabel />
            </dd>
          </div>
          <div className={ROW}>
            <dt className={LABEL}>채택률</dt>
            <dd className="font-black tabular-nums" data-field="acceptRate">
              {formatPercent(profile.acceptRate)}
            </dd>
          </div>
        </>
      )}
    </dl>
  );
}
