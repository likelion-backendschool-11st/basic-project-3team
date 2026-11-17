// 질문·답변 본문을 마크다운으로 보여 준다 (#62, REQ-QUESTION-003, REQ-QNA-003).
// XSS: react-markdown은 본문 속 HTML 태그를 실행하지 않고(rehype-raw를 쓰지 않음) javascript: 같은 위험한 링크 주소도 막는다.
// 쓰는 화면의 *.tailwind.cjs content에 components 폴더가 들어 있어야 스타일이 생긴다 (화면별 preflight가 꺼져 있어 요소마다 클래스를 준다).
import "highlight.js/styles/github-dark.css";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

const COMPONENTS: Components = {
  h1: ({ node: _node, ...props }) => <h1 className="text-lg font-black mt-5 mb-2" {...props} />,
  h2: ({ node: _node, ...props }) => <h2 className="text-base font-extrabold mt-5 mb-2" {...props} />,
  h3: ({ node: _node, ...props }) => <h3 className="text-sm font-extrabold mt-4 mb-1.5" {...props} />,
  p: ({ node: _node, ...props }) => <p className="my-2 leading-relaxed whitespace-pre-wrap break-words" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="list-disc pl-6 my-2 space-y-1" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />,
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="border-l-4 border-devin-line pl-3 my-3 text-devin-gray" {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a className="text-devin-blue underline break-all" target="_blank" rel="noopener noreferrer nofollow" {...props} />
  ),
  img: ({ node: _node, alt, ...props }) => (
    <img className="max-w-full my-2 border border-devin-line rounded-lg" alt={alt ?? ""} {...props} />
  ),
  hr: ({ node: _node, ...props }) => <hr className="my-4 border-devin-line" {...props} />,
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto my-3">
      <table className="border-collapse text-sm" {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th className="border border-devin-line bg-devin-bg px-3 py-1.5 text-xs font-extrabold" {...props} />
  ),
  td: ({ node: _node, ...props }) => <td className="border border-devin-line px-3 py-1.5" {...props} />,
  // 코드 블록(```): 언어를 적으면 rehype-highlight가 색상 클래스를 붙인다. 언어가 없어도 같은 어두운 블록으로 보이게
  // 블록 모양은 <pre>에서 정하고, 안쪽 <code>의 인라인 코드 모양은 [&>code]: 클래스로 덮는다.
  // 바탕·글자색은 코드 색상 테마(github-dark)의 값이라 devin-* 색 대신 그대로 둔다.
  pre: ({ node: _node, ...props }) => (
    <pre
      className="my-3 rounded-lg border-devin border-devin-ink overflow-x-auto text-sm leading-relaxed bg-[#0d1117] text-[#c9d1d9] [&>code]:block [&>code]:p-4 [&>code]:bg-transparent [&>code]:border-0 [&>code]:rounded-none [&>code]:text-inherit [&>code]:text-[1em]"
      {...props}
    />
  ),
  // 인라인 코드(`code`)
  code: ({ node: _node, className, ...props }) => (
    <code
      className={`${className ?? ""} bg-devin-tag rounded px-1.5 py-0.5 text-[0.85em] font-mono text-devin-ink`}
      {...props}
    />
  ),
};

export default function MarkdownView({ content }: { content: string }) {
  return (
    <div className="text-devin-ink break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false }]]}
        components={COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
