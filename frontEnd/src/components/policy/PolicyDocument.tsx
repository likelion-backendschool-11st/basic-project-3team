import { Link } from "react-router-dom";
import Footer from "../Footer";
import Header from "../Header";
import { EFFECTIVE_DATE, PRIVACY, TERMS, type PolicySection } from "./policyContent";

type PolicyKind = "terms" | "privacy";

const DOCUMENTS: Record<PolicyKind, { title: string; path: string; sections: PolicySection[] }> = {
  terms: { title: "이용약관", path: "/terms", sections: TERMS },
  privacy: { title: "개인정보처리방침", path: "/privacy", sections: PRIVACY },
};

function Section({ section, id }: { section: PolicySection; id: string }) {
  const [head, ...rows] = section.table ?? [];
  return (
    <section className="scroll-mt-6" id={id}>
      <h2 className="text-lg font-extrabold mb-3 pb-2 border-b-2 border-[#111111]">{section.title}</h2>
      {section.body?.map((paragraph) => (
        <p className="text-[15px] leading-relaxed text-gray-800 mb-2" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {head && (
        <div className="overflow-x-auto my-3">
          <table className="w-full text-sm border-2 border-[#111111] border-collapse">
            <thead className="bg-[#FFD43B]">
              <tr>
                {head.map((cell) => (
                  <th
                    className="text-left px-3 py-2 border-2 border-[#111111] font-extrabold whitespace-nowrap"
                    key={cell}
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      className={`px-3 py-2 border-2 border-[#111111] align-top ${index === 0 ? "font-bold whitespace-nowrap" : ""}`}
                      key={cell}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.list && (
        <ul className="space-y-1.5 text-[15px] leading-relaxed text-gray-800 list-disc pl-5">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.note && <p className="mt-2 text-xs font-semibold text-gray-500">※ {section.note}</p>}
      {section.link && (
        <a
          className="mt-3 inline-block text-sm font-bold text-[#2563EB] underline break-all"
          href={section.link}
          rel="noreferrer"
          target="_blank"
        >
          {section.link}
        </a>
      )}
    </section>
  );
}

// 이용약관·개인정보처리방침 공통 화면 (#158)
export default function PolicyDocument({ kind }: { kind: PolicyKind }) {
  const { title, sections } = DOCUMENTS[kind];
  return (
    <div
      className="min-h-screen flex flex-col justify-between antialiased text-[#111111]"
      style={{
        backgroundColor: "rgb(255, 253, 245)",
        backgroundImage: "radial-gradient(rgb(217, 212, 195) 1.2px, transparent 1.2px)",
        backgroundSize: "18px 18px",
      }}
    >
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="정책 문서" className="flex flex-wrap gap-2 mb-5">
          {(Object.keys(DOCUMENTS) as PolicyKind[]).map((key) => (
            <Link
              aria-current={key === kind ? "page" : undefined}
              className={`px-4 py-2 text-sm font-bold rounded-lg border-[2.5px] border-[#111111] ${
                key === kind ? "bg-[#FFD43B] shadow-[3px_3px_0_#111111]" : "bg-white hover:bg-gray-50"
              }`}
              key={key}
              to={DOCUMENTS[key].path}
            >
              {DOCUMENTS[key].title}
            </Link>
          ))}
        </nav>
        <article className="bg-white p-6 sm:p-10 border-[2.5px] border-[#111111] rounded-xl shadow-[5px_5px_0_#111111]">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-gray-600 font-medium mb-6">
            시행일: {EFFECTIVE_DATE} · 학습 목적으로 만든 팀 프로젝트의 정책입니다.
          </p>
          <nav aria-label="목차" className="mb-8 p-4 bg-[#F9F7F1] rounded-lg border-2 border-[#111111] text-sm">
            <p className="font-extrabold mb-2">목차</p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {sections.map((section, index) => (
                <li key={section.title}>
                  <a className="hover:underline" href={`#${kind}-${index}`}>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Section id={`${kind}-${index}`} key={section.title} section={section} />
            ))}
          </div>
          {/* 긴 문서를 끝까지 읽은 뒤 다시 스크롤하지 않아도 되게 맨 위로 올려 준다. */}
          <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-300 flex justify-center">
            <button
              className="px-5 py-2.5 text-sm font-bold bg-white rounded-lg border-[2.5px] border-[#111111] shadow-[3px_3px_0_#111111] hover:bg-[#FFD43B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              ↑ 맨 위로
            </button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
