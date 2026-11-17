// 채택 랭킹 (#64, REQ-RANKING-001). 데이터는 GET /api/members/ranking (docs/api.md 3장 채택 랭킹).
// 로그인하지 않아도 볼 수 있다. 닉네임은 작성자 요약 팝오버로만 보고, 페이지를 옮기지 않는다.
// #190: docs/ui-guide.md 공통 값(uiStyles, GradeIcon, ListStatus, writer)으로 바꿨다.
import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { getRanking, type RankingItem } from "../api/mypage";
import AuthorPopover from "../components/AuthorPopover";
import Footer from "../components/Footer";
import { GRADES } from "../components/gradeBadge";
import GradeIcon from "../components/GradeIcon";
import Header from "../components/Header";
import ListStatus from "../components/ListStatus";
import { buttonClass, CARD, PAGE_BACKGROUND } from "../components/uiStyles";
import { formatNumber, formatPercent } from "../components/writer";
import { usePageTitle } from "../hooks/usePageTitle";

// 앞에서 3명은 시상대 카드로, 나머지는 줄로 보여 준다 (#159). 동점이라 rank가 같아도 앞 3명만 카드다.
const PODIUM_SIZE = 3;
// 3명일 때만 가운데 1위·왼쪽 2위·오른쪽 3위로 옮긴다. HTML 순서는 1·2·3 그대로라 화면 읽기 프로그램은 1위부터 읽는다.
const PODIUM_ORDER = ["order-2", "order-1", "order-3"];
// 계단 단차 (아래쪽 기준): 1위 32px·2위 16px 위로, 3위는 그대로. 작은 화면은 절반.
const PODIUM_LIFT = ["-translate-y-4 sm:-translate-y-8", "-translate-y-2 sm:-translate-y-4", ""];
// 랭킹 메달: 1·2·3위 = 골드·실버·브론즈 색 원 + 순위 숫자 (ui-guide.md 7절). rank 기준이라 1위 동점이면 둘 다 금색
const MEDAL_COLOR: Record<number, string> = {
  1: GRADES.GOLD.color,
  2: GRADES.SILVER.color,
  3: GRADES.BRONZE.color,
};

// 1위 카드는 크림 바탕으로 구분한다 (CARD의 흰 바탕과 겹치지 않게 바탕만 바꾼 같은 모양)
const FIRST_CARD = CARD.replace("bg-devin-paper", "bg-devin-bg");

type State = { status: "loading" } | { status: "error"; message: string } | { status: "done"; items: RankingItem[] };

export default function Ranking() {
  usePageTitle("채택 랭킹");
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
        if (!cancelled) {
          setState({
            status: "error",
            message: getErrorMessage(err, "랭킹을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  return (
    <div className={`${PAGE_BACKGROUND} min-h-screen flex flex-col justify-between text-devin-ink antialiased`}>
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="pb-4">
          <h1 className="text-2xl font-black">채택 랭킹</h1>
          <p className="mt-1 text-sm text-devin-gray">
            채택된 답변이 많은 순 · 같으면 받은 좋아요가 많은 순 · 상위 20명
          </p>
        </div>

        {state.status === "loading" && (
          <div className={CARD}>
            <ListStatus kind="loading">랭킹을 불러오는 중이에요.</ListStatus>
          </div>
        )}

        {state.status === "error" && (
          <div className={CARD}>
            <ListStatus
              kind="error"
              action={
                <button
                  className={buttonClass("secondary", "sm")}
                  type="button"
                  onClick={() => setRetryKey((key) => key + 1)}
                >
                  다시 시도
                </button>
              }
            >
              {state.message}
            </ListStatus>
          </div>
        )}

        {state.status === "done" && state.items.length === 0 && (
          <div className={CARD}>
            <ListStatus kind="empty">아직 채택된 답변이 없어요.</ListStatus>
          </div>
        )}

        {state.status === "done" && state.items.length > 0 && (
          <>
            <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4 lg:gap-5 pt-10" data-purpose="ranking-podium">
              {state.items.slice(0, PODIUM_SIZE).map((item, index, podium) => (
                <PodiumCard
                  key={item.memberId}
                  item={item}
                  className={`${podium.length === PODIUM_SIZE ? PODIUM_ORDER[index] : ""} ${PODIUM_LIFT[index]}`}
                />
              ))}
            </ol>
            {state.items.length > PODIUM_SIZE && (
              <ol className="mt-6 flex flex-col gap-3" data-purpose="ranking-list">
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

function Medal({ rank, size }: { rank: number; size: string }) {
  return (
    <span
      className={`shrink-0 flex items-center justify-center rounded-full border-devin border-devin-ink bg-devin-paper font-black tabular-nums text-devin-ink ${size}`}
      style={MEDAL_COLOR[rank] ? { backgroundColor: MEDAL_COLOR[rank] } : undefined}
      aria-label={`${rank}위`}
    >
      {rank}
    </span>
  );
}

// 1~3위 시상대 카드: 정사각형, 가운데 정렬로 메달 → 닉네임 → 등급 → 채택 수 → 채택률·좋아요
// 카드 폭이 휴대폰 약 100px, sm 약 180px, lg 약 225px라 정사각형 안에 들어가도록 세 단계로 키운다 (메달 32·48·64px).
// 감싸는 span(AuthorPopover)도 카드 폭을 넘지 않게 해야 긴 닉네임이 말줄임된다.
// 팝오버가 열린 카드만 위로 올린다. hover·focus로 올리면 다른 카드에 포커스가 남았을 때 order 순서상 뒤 카드가 덮는다.
function PodiumCard({ item, className }: { item: RankingItem; className: string }) {
  const first = item.rank === 1;

  return (
    <li
      className={`${first ? FIRST_CARD : CARD} relative z-0 has-[[aria-expanded=true]]:z-20 aspect-square min-w-0 flex flex-col items-center justify-center gap-0.5 sm:gap-1 lg:gap-1.5 p-1.5 sm:p-4 text-center ${className}`}
      data-rank={item.rank}
    >
      <Medal rank={item.rank} size="w-8 h-8 text-sm sm:w-12 sm:h-12 sm:text-lg lg:w-16 lg:h-16 lg:text-2xl" />
      <div className="w-full min-w-0 flex justify-center [&>span]:max-w-full">
        <AuthorPopover
          className="block max-w-full truncate rounded font-black text-xs leading-tight sm:text-sm lg:text-lg hover:underline"
          memberId={item.memberId}
          nickname={item.nickname}
        />
      </div>
      <span className="hidden sm:inline-flex">
        <GradeIcon grade={item.grade} withLabel />
      </span>
      <span className="sm:hidden">
        <GradeIcon grade={item.grade} />
      </span>
      <p className="font-black text-sm sm:text-lg lg:text-2xl leading-tight tabular-nums">
        {formatNumber(item.acceptedCount)}개 채택
      </p>
      <p className="hidden sm:block text-[11px] lg:text-xs text-devin-gray tabular-nums">
        채택률 {formatPercent(item.acceptRate)} · 좋아요 {formatNumber(item.likeCount)}
      </p>
    </li>
  );
}

// 4~20위 줄
function RankingRow({ item }: { item: RankingItem }) {
  return (
    <li
      className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 rounded-xl bg-devin-paper border-devin border-devin-ink shadow-devin-sm"
      data-rank={item.rank}
    >
      <Medal rank={item.rank} size="w-10 h-10 text-base" />

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <AuthorPopover
          className="rounded font-black text-base hover:underline truncate max-w-[12rem]"
          memberId={item.memberId}
          nickname={item.nickname}
        />
        <GradeIcon grade={item.grade} withLabel />
      </div>

      <dl className="flex items-center gap-4 text-sm tabular-nums">
        <Stat label="채택" value={`${formatNumber(item.acceptedCount)}개`} strong />
        <Stat label="채택률" value={formatPercent(item.acceptRate)} />
        <Stat label="좋아요" value={formatNumber(item.likeCount)} />
      </dl>
    </li>
  );
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <dt className="text-[11px] text-devin-gray">{label}</dt>
      <dd className={strong ? "font-black" : "font-bold"}>{value}</dd>
    </div>
  );
}
