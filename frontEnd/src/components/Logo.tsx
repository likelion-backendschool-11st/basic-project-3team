import { Link } from "react-router-dom";
import { FOCUS } from "./uiStyles";
import { useLogoEasterEgg } from "./easterEgg/useEasterEggEffects";
import { LOGO_TYPE_STEPS } from "./easterEgg/easterEggs";

// 공통 헤더와, 공통 헤더를 쓰지 않는 로그인·회원가입·찾기 화면의 헤더 안쪽 틀. 로고 위치를 모든 화면에서 같게 한다 (#156)
export const HEADER_INNER_CLASS = "max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4";

// 모든 화면이 같이 쓰는 로고 (#156)
export default function Logo({ to }: { to: string }) {
  // 이스터에그: `cd ..`이면 3초 동안 "out_", `devin`이면 한 글자씩 다시 타이핑한다. 평소에는 그대로다.
  const { word, shown, blink, hop } = useLogoEasterEgg();
  // 타이핑 중 아직 안 친 글자는 자리만 남기고 숨겨, 헤더가 좌우로 움직이지 않게 한다.
  const hide = (index: number) => (index >= shown ? "invisible" : "");
  const typing = shown < LOGO_TYPE_STEPS;
  return (
    <Link to={to} className={`flex items-center gap-1.5 rounded select-none ${FOCUS}`} aria-label="Dev in_ 메인으로">
      <span className="text-2xl font-black text-devin-ink tracking-tight">
        {typing
          ? [..."Dev"].map((char, index) => (
              <span key={index} className={hide(index)}>
                {char}
              </span>
            ))
          : "Dev"}
      </span>
      {/* 글자가 바뀔 때마다(key) 상자를 새로 그려 폴짝 애니메이션을 다시 돌린다 */}
      <span
        key={word}
        className={`bg-devin-yellow border-devin border-devin-ink px-1.5 py-0.5 rounded text-lg font-mono font-bold text-devin-ink shadow-devin-sm ${hide(3)} ${hop ? "egg-logo-hop" : ""}`}
      >
        {typing
          ? [...word].map((char, index) => (
              <span key={index} className={hide(3 + index)}>
                {char}
              </span>
            ))
          : word}
        {typing || blink ? (
          <span className={`${typing ? hide(LOGO_TYPE_STEPS - 1) : ""} ${blink ? "egg-cursor" : ""}`}>_</span>
        ) : (
          "_"
        )}
      </span>
    </Link>
  );
}
