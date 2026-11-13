import { useRef } from "react";

export type MarkdownFormat = "bold" | "italic" | "codeBlock" | "link" | "image";

// 선택한 글자를 마크다운 기호로 감싼다. 선택이 없으면 안내 글자를 넣고 그 글자를 선택해 바로 고쳐 쓸 수 있게 한다.
// 이미지는 파일 업로드가 범위 밖이라(docs/api.md) 주소를 넣는 문법만 넣는다.
export function applyMarkdownFormat(text: string, start: number, end: number, format: MarkdownFormat) {
  const selected = text.slice(start, end);
  const before = text.slice(0, start);
  const after = text.slice(end);

  const wrap = (open: string, close: string, placeholder: string) => {
    const inner = selected || placeholder;
    return { insert: `${open}${inner}${close}`, selectFrom: open.length, selectTo: open.length + inner.length };
  };

  let result: { insert: string; selectFrom: number; selectTo: number };
  if (format === "bold") result = wrap("**", "**", "굵은 글씨");
  else if (format === "italic") result = wrap("*", "*", "기울인 글씨");
  else if (format === "codeBlock") {
    // 코드 블록은 줄 맨 앞에서 시작해야 한다
    const lead = before === "" || before.endsWith("\n") ? "" : "\n";
    result = wrap(`${lead}\`\`\`\n`, "\n```\n", "코드를 입력하세요");
  } else {
    const prefix = format === "image" ? "!" : "";
    const label = selected || (format === "image" ? "이미지 설명" : "링크 설명");
    const url = format === "image" ? "이미지 주소" : "https://";
    const head = `${prefix}[${label}](`;
    // 설명은 이미 있으니 주소 부분을 선택한다
    result = { insert: `${head}${url})`, selectFrom: head.length, selectTo: head.length + url.length };
  }

  return {
    text: before + result.insert + after,
    selectionStart: start + result.selectFrom,
    selectionEnd: start + result.selectTo,
  };
}

// 질문하기·질문 수정 화면의 툴바(B, I, 코드 블록, 링크, 이미지)를 내용칸(textarea)에 연결한다 (#62).
export function useMarkdownToolbar(value: string, setValue: (value: string) => void) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function apply(format: MarkdownFormat) {
    const el = textareaRef.current;
    if (!el) return;
    const next = applyMarkdownFormat(value, el.selectionStart, el.selectionEnd, format);
    setValue(next.text);
    // 값이 반영된 다음 프레임에 커서·선택 위치를 맞춘다
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  }

  return { textareaRef, apply };
}
