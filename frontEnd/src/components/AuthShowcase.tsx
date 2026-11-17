import Markdown from "./markdown/Markdown";
import { CARD } from "./uiStyles";

// 로그인·회원가입 화면 왼쪽 소개 패널 (#189). 두 화면이 같은 내용을 쓰므로 한 곳에 둔다.
// 코드 미리보기는 질문·답변 본문과 같은 마크다운 코드 블록으로 그려서 색을 직접 정하지 않는다.

const CODE_FILE = "network.connect.ts";

const CODE = [
  "```ts",
  "import { DevInCluster, PeerSync } from '@dev-in/network';",
  "",
  "// Initialize developer global session",
  "const cluster = await DevInCluster.connect({",
  "  region: 'global-edge',",
  "  autoReview: true,",
  "  protocol: 'p2p-streaming',",
  "});",
  "cluster.onReady(() =>",
  "  console.log('Connected to 180,000+ developers.'),",
  ");",
  "```",
].join("\n");

const METRICS = [
  { value: "180K+", label: "글로벌 개발자" },
  { value: "94.8%", label: "기술 Q&A 해결률" },
  { value: "3.2M", label: "코드 스니펫" },
];

export default function AuthShowcase({ className = "" }: { className?: string }) {
  return (
    <section className={`${CARD} p-4 sm:p-6 flex flex-col justify-between min-w-0 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl font-black text-devin-ink leading-snug mb-4">
          전 세계 개발자들과
          <br />
          <span className="inline-block mt-2 px-1.5 bg-devin-yellow border-devin border-devin-ink rounded">
            실시간으로 연결되는
          </span>{" "}
          공간
        </h1>

        <p className="text-sm font-medium text-devin-gray leading-relaxed mb-6">
          아키텍처 토론, 오픈소스 기여, 코드 리뷰 파트너까지.
          <br className="hidden sm:inline" /> 엔지니어링 표준을 함께 정의하는{" "}
          <strong className="font-bold text-devin-ink">Dev in_</strong> 생태계에 참여해 보세요.
        </p>

        {/* 좁은 칸(회원가입, 휴대폰 폭)에서도 가로 스크롤 없이 보이게 긴 줄은 줄바꿈한다 */}
        <div className="mb-6 min-w-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-all">
          <p className="text-xs font-mono font-bold text-devin-gray">{CODE_FILE}</p>
          <Markdown content={CODE} />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 pt-4 border-t-devin border-devin-line">
        {METRICS.map(({ value, label }) => (
          // dt(이름)를 먼저 두고, 화면에는 숫자가 위에 오도록 순서만 뒤집는다.
          <div className="min-w-0 py-2 flex flex-col-reverse text-center" key={label}>
            <dt className="mt-0.5 text-xs font-bold text-devin-gray break-keep">{label}</dt>
            <dd className="text-lg font-black font-mono tabular-nums text-devin-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
