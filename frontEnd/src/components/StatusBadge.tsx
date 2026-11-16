// 상태 배지 (docs/ui-guide.md 7절): 알약형 + 아이콘.
// 색으로 채우는 건 그 화면에서 눈여겨봐야 할 상태 하나(filled·danger), 나머지는 흰 바탕이다.

type Tone = "filled" | "danger" | "outline" | "quiet" | "dashed";

const STATUS = {
  accepted: { label: "채택", icon: "check", tone: "filled" },
  answerAccepted: { label: "채택됨", icon: "check", tone: "filled" },
  waiting: { label: "답변 대기", icon: "schedule", tone: "outline" },
  unaccepted: { label: "미채택", icon: "forum", tone: "quiet" },
  reportPending: { label: "처리 대기", icon: "hourglass_top", tone: "filled" },
  reportResolved: { label: "처리 완료", icon: "task_alt", tone: "quiet" },
  reportRejected: { label: "반려", icon: "close", tone: "quiet" },
  memberActive: { label: "정상", icon: "person", tone: "quiet" },
  memberBanned: { label: "정지", icon: "block", tone: "danger" },
  memberWithdrawn: { label: "탈퇴", icon: "logout", tone: "dashed" },
} as const satisfies Record<string, { label: string; icon: string; tone: Tone }>;

export type StatusKind = keyof typeof STATUS;

const TONE_CLASS: Record<Tone, string> = {
  filled: "bg-devin-ink text-white border-devin-ink",
  danger: "bg-devin-red text-white border-devin-ink",
  outline: "bg-devin-paper text-devin-ink border-devin-ink",
  quiet: "bg-devin-paper text-devin-gray border-devin-gray-light",
  dashed: "bg-devin-paper text-devin-gray border-devin-gray-light border-dashed",
};

export default function StatusBadge({ kind }: { kind: StatusKind }) {
  const { label, icon, tone } = STATUS[kind];
  return (
    <span
      className={`inline-flex items-center gap-0.5 h-6 pl-[7px] pr-2.5 rounded-full border-[1.5px] text-xs font-extrabold whitespace-nowrap shrink-0 ${TONE_CLASS[tone]}`}
    >
      <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}
