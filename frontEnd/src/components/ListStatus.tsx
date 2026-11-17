import { useEffect, useState, type ReactNode } from "react";

type Kind = "loading" | "error" | "empty";

const ICON: Record<Kind, string> = {
  loading: "progress_activity",
  error: "error",
  empty: "inbox",
};

// 불러오기가 이 시간보다 빨리 끝나면 불러오는 중 표시를 보여 주지 않는다 (잠깐 깜빡이지 않게, #213).
const LOADING_DELAY_MS = 300;

// 목록 영역 안의 불러오는 중·불러오기 실패·빈 목록 (docs/ui-guide.md 8절). 화면에 문구 상자를 직접 만들지 않는다.
// 빈 목록은 점선 상자에 아이콘, 한 줄 설명, 다음 행동(action)을 둔다.
// 예: <ListStatus kind="empty" action={<Link ...>질문하기</Link>}>아직 질문이 없어요.</ListStatus>
// kind를 빼면 예전처럼 문구만 가운데에 보여 준다.
export default function ListStatus({
  kind,
  children,
  action,
}: {
  kind?: Kind;
  children: ReactNode;
  action?: ReactNode;
}) {
  const [loadingShown, setLoadingShown] = useState(false);
  useEffect(() => {
    if (kind !== "loading") return;
    const timer = setTimeout(() => setLoadingShown(true), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [kind]);

  if (!kind) return <div className="p-6 text-center text-sm font-semibold text-devin-gray">{children}</div>;

  const box = kind === "empty" ? "m-4 border-devin border-dashed border-devin-gray-light rounded-xl" : "";
  // 기다리는 동안에도 자리는 남겨 두어, 문구가 나타날 때 화면이 밀리지 않게 한다.
  const hidden = kind === "loading" && !loadingShown ? "invisible" : "";
  return (
    <div
      className={`${box} ${hidden} flex flex-col items-center gap-2 p-6 text-center text-sm font-semibold text-devin-gray`}
      role={kind === "error" ? "alert" : "status"}
    >
      <span
        className={`material-symbols-outlined text-[28px] leading-none ${
          kind === "error" ? "text-devin-red" : ""
        } ${kind === "loading" ? "animate-spin" : ""}`}
        aria-hidden="true"
      >
        {ICON[kind]}
      </span>
      <div>{children}</div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
