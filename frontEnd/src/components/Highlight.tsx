// text 안의 keyword를 대소문자 구분 없이 강조한다 (REQ-SEARCH-001).
export default function Highlight({ text, keyword }: { text: string; keyword?: string }) {
  const needle = keyword?.trim().toLowerCase();
  if (!needle) return <>{text}</>;

  const parts: { value: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  let start = 0;
  for (let index = lower.indexOf(needle); index !== -1; index = lower.indexOf(needle, start)) {
    if (index > start) parts.push({ value: text.slice(start, index), match: false });
    parts.push({ value: text.slice(index, index + needle.length), match: true });
    start = index + needle.length;
  }
  if (start < text.length) parts.push({ value: text.slice(start), match: false });

  return (
    <>
      {parts.map((part, i) =>
        part.match ? (
          <mark key={i} className="bg-[#FFD43B] text-inherit px-0.5">
            {part.value}
          </mark>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </>
  );
}
