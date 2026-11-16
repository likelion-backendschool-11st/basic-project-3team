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

// 1~3위는 노란 바탕 + 굵은 테두리로 눈에 띄게 한다. 테두리는 3px: 2.5px는 브라우저가 2px로 그려 다른 줄과 구분되지 않는다.
const TOP_RANK = 3;

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
          <ol className="flex flex-col gap-3" data-purpose="ranking-list">
            {state.items.map((item) => (
              <RankingRow key={item.memberId} item={item} />
            ))}
          </ol>
        )}
      </main>

      <Footer />
    </div>
  );
}

function RankingRow({ item }: { item: RankingItem }) {
  const top = item.rank <= TOP_RANK;
  const grade = GRADES[item.grade];

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-[#111111] ${
        top ? "bg-[#FFD43B] border-[3px] shadow-[4px_4px_0_#111111]" : "bg-white border-2 shadow-[2px_2px_0_#111111]"
      }`}
      data-rank={item.rank}
    >
      <span
        className={`shrink-0 w-10 h-10 flex items-center justify-center font-black font-mono border-2 border-[#111111] rounded-full ${
          top ? "bg-white text-lg" : "bg-gray-50 text-base"
        }`}
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
          className="shrink-0 px-2 py-0.5 rounded text-xs font-bold text-white border border-[#111111]"
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
