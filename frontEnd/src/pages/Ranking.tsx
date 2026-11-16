// 채택 랭킹 (#64, REQ-RANKING-001). 데이터는 GET /api/members/ranking (docs/api.md 3장 채택 랭킹).
// 로그인하지 않아도 볼 수 있다. 닉네임은 작성자 요약 팝오버로만 보고, 페이지를 옮기지 않는다.
import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { getRanking, type RankingItem } from "../api/mypage";
import AuthorPopover from "../components/AuthorPopover";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ListStatus from "../components/ListStatus";
import { GRADES } from "../components/writer";

// 앞에서 3명은 시상대 카드로, 나머지는 줄로 보여 준다 (#159). 동점이라 rank가 같아도 앞 3명만 카드다.
const PODIUM_SIZE = 3;
// 3명일 때만 가운데 1위·왼쪽 2위·오른쪽 3위로 옮긴다. HTML 순서는 1·2·3 그대로라 화면 읽기 프로그램은 1위부터 읽는다.
const PODIUM_ORDER = ["order-2", "order-1", "order-3"];
// 계단 단차 (아래쪽 기준): 1위 32px·2위 16px 위로, 3위는 그대로. 작은 화면은 절반.
const PODIUM_LIFT = ["-translate-y-4 sm:-translate-y-8", "-translate-y-2 sm:-translate-y-4", ""];
// 메달 색 (rank 기준이라 1위 동점이면 둘 다 금색)
const MEDAL_COLOR: Record<number, string> = { 1: "#FFD43B", 2: "#D1D5DB", 3: "#D97706" };

type State = { status: "loading" } | { status: "error"; message: string } | { status: "done"; items: RankingItem[] };

export default function Ranking() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getRanking()
      .then((items) => {
        if (!cancelled) setState({ status: "done", items });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", message: getErrorMessage(err, "랭킹을 불러오지 못했습니다.") });
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  return (
    <div
      className="min-h-screen flex flex-col justify-between antialiased"
      style={{
        backgroundColor: "rgb(255, 253, 245)",
        backgroundImage: "radial-gradient(rgb(217, 212, 195) 1.2px, transparent 1.2px)",
        backgroundSize: "18px 18px",
      }}
    >
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="pb-4">
          <h1 className="text-2xl font-black tracking-tight text-gray-950">채택 랭킹</h1>
          <p className="mt-1 text-sm font-medium text-gray-600">
            채택된 답변이 많은 순 · 같으면 받은 좋아요가 많은 순 · 상위 20명
          </p>
        </div>

        {state.status === "loading" && (
          <div className="bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111]">
            <ListStatus>랭킹을 불러오는 중입니다...</ListStatus>
          </div>
        )}

        {state.status === "error" && (
          <div className="bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111]">
            <ListStatus>
              <p className="text-[#E11D48]">{state.message}</p>
              <button
                className="mt-3 px-3 py-1.5 bg-white border-2 border-[#111111] text-xs font-bold shadow-[2px_2px_0_#111111] hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                type="button"
                onClick={() => setRetryKey((key) => key + 1)}
              >
                다시 시도
              </button>
            </ListStatus>
          </div>
        )}

        {state.status === "done" && state.items.length === 0 && (
          <div className="bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111]">
            <ListStatus>아직 채택된 답변이 없어요.</ListStatus>
          </div>
        )}

        {state.status === "done" && state.items.length > 0 && (
          <>
            <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4 md:gap-5 pt-10" data-purpose="ranking-podium">
              {state.items.slice(0, PODIUM_SIZE).map((item, index, podium) => (
                <PodiumCard
                  key={item.memberId}
                  item={item}
                  className={`${podium.length === PODIUM_SIZE ? PODIUM_ORDER[index] : ""} ${PODIUM_LIFT[index]}`}
                />
              ))}
            </ol>
            {state.items.length > PODIUM_SIZE && (
              <ol className="mt-7 flex flex-col gap-3" data-purpose="ranking-list">
                {state.items.slice(PODIUM_SIZE).map((item) => (
                  <RankingRow key={item.memberId} item={item} />
                ))}
              </ol>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// 1~3위 시상대 카드: 정사각형, 가운데 정렬로 메달 → 닉네임 → 등급 → 채택 수 → 채택률·좋아요
// 카드 폭이 휴대폰 약 100px, sm 약 180px, md 이상 약 225px라 정사각형 안에 들어가도록 세 단계로 키운다 (메달 32·48·64px).
// 감싸는 span(AuthorPopover)도 카드 폭을 넘지 않게 해야 긴 닉네임이 말줄임된다.
// 팝오버가 열린 카드만 위로 올린다. hover·focus로 올리면 다른 카드에 포커스가 남았을 때 order 순서상 뒤 카드가 덮는다.
function PodiumCard({ item, className }: { item: RankingItem; className: string }) {
  const grade = GRADES[item.grade];
  const first = item.rank === 1;

  return (
    <li
      className={`relative z-0 has-[[aria-expanded=true]]:z-20 aspect-square min-w-0 flex flex-col items-center justify-center sm:gap-1 md:gap-1.5 p-1.5 sm:p-2 md:p-3 text-center border-[3px] border-[#111111] ${
        first ? "bg-[#FFF7D1] shadow-[6px_6px_0_#111111]" : "bg-white shadow-[4px_4px_0_#111111]"
      } ${className}`}
      data-rank={item.rank}
    >
      <span
        className="shrink-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border-[3px] border-[#111111] font-black font-mono text-base sm:text-xl md:text-2xl text-[#111111]"
        style={{ backgroundColor: MEDAL_COLOR[item.rank] }}
        aria-label={`${item.rank}위`}
      >
        {item.rank}
      </span>
      <div className="w-full min-w-0 flex justify-center [&>span]:max-w-full">
        <AuthorPopover
          className="block max-w-full truncate font-black text-xs leading-tight sm:text-sm md:text-lg text-gray-950 hover:underline"
          memberId={item.memberId}
          nickname={item.nickname}
        />
      </div>
      <span
        className="shrink-0 px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[10px] leading-tight sm:text-xs font-bold text-[#111111] border border-[#111111]"
        style={{ backgroundColor: grade.color }}
      >
        {grade.label}
      </span>
      <p className="font-black text-sm sm:text-lg md:text-2xl leading-tight text-gray-950">
        {item.acceptedCount}개 채택
      </p>
      <p className="hidden sm:block text-[11px] md:text-xs font-medium text-gray-500">
        채택률 {item.acceptRate}% · 좋아요 {item.likeCount}
      </p>
    </li>
  );
}

// 4~20위 줄
function RankingRow({ item }: { item: RankingItem }) {
  const grade = GRADES[item.grade];

  return (
    <li
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 bg-white border-2 border-[#111111] shadow-[2px_2px_0_#111111]"
      data-rank={item.rank}
    >
      <span
        className="shrink-0 w-10 h-10 flex items-center justify-center font-black font-mono text-base bg-gray-50 border-2 border-[#111111] rounded-full"
        aria-label={`${item.rank}위`}
      >
        {item.rank}
      </span>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <AuthorPopover
          className="font-black text-base text-gray-950 hover:underline truncate max-w-[12rem]"
          memberId={item.memberId}
          nickname={item.nickname}
        />
        <span
          className="shrink-0 px-2 py-0.5 rounded text-xs font-bold text-[#111111] border border-[#111111]"
          style={{ backgroundColor: grade.color }}
        >
          {grade.label}
        </span>
      </div>

      <dl className="flex items-center gap-4 text-sm font-mono">
        <Stat label="채택" value={`${item.acceptedCount}개`} strong />
        <Stat label="채택률" value={`${item.acceptRate}%`} />
        <Stat label="좋아요" value={`${item.likeCount}`} />
      </dl>
    </li>
  );
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <dt className="text-[11px] font-sans font-medium text-gray-600">{label}</dt>
      <dd className={strong ? "font-black text-gray-950" : "font-bold text-gray-800"}>{value}</dd>
    </div>
  );
}
