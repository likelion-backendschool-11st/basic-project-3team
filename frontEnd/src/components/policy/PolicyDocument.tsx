import { Link } from "react-router-dom";
import Footer from "../Footer";
import Header from "../Header";
import { buttonClass, CARD, FOCUS, PAGE_BACKGROUND, TABLE, tabClass } from "../uiStyles";
import { EFFECTIVE_DATE, PRIVACY, TERMS, type PolicySection } from "./policyContent";

type PolicyKind = "terms" | "privacy";

const DOCUMENTS: Record<PolicyKind, { title: string; path: string; sections: PolicySection[] }> = {
  terms: { title: "이용약관", path: "/terms", sections: TERMS },
  privacy: { title: "개인정보처리방침", path: "/privacy", sections: PRIVACY },
};

const TEXT = "text-sm leading-relaxed text-devin-ink";

function Section({ section, id }: { section: PolicySection; id: string }) {
  const [head, ...rows] = section.table ?? [];
  return (
    <section className="scroll-mt-6" id={id}>
      <h2 className="text-lg font-extrabold mb-3 pb-2 border-b-devin border-devin-ink">{section.title}</h2>
      {section.body?.map((paragraph) => (
        <p className={`${TEXT} mb-2`} key={paragraph}>
          {paragraph}
        </p>
      ))}
      {head && (
        <div className={`${TABLE.wrap} my-3`}>
          <table className={TABLE.table}>
            <thead>
              <tr>
                {head.map((cell) => (
                  <th className={TABLE.th} key={cell}>
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className={TABLE.tr} key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      className={`${TABLE.td} align-top ${index === 0 ? "font-bold whitespace-nowrap" : ""}`}
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
        <ul className={`${TEXT} space-y-1.5 list-disc pl-5`}>
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.note && <p className="mt-2 text-xs font-semibold text-devin-gray">※ {section.note}</p>}
      {section.link && (
        <a
          className={`mt-3 inline-block rounded text-sm font-bold text-devin-blue underline break-all ${FOCUS}`}
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

// 이용약관·개인정보처리방침 공통 화면 (#158). #189: docs/ui-guide.md 공통 값(uiStyles)으로 바꿨다.
export default function PolicyDocument({ kind }: { kind: PolicyKind }) {
  const { title, sections } = DOCUMENTS[kind];
  return (
    <div className={`${PAGE_BACKGROUND} min-h-screen flex flex-col justify-between antialiased text-devin-ink`}>
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="정책 문서" className="flex flex-wrap gap-2 mb-5">
          {(Object.keys(DOCUMENTS) as PolicyKind[]).map((key) => (
            <Link
              aria-current={key === kind ? "page" : undefined}
              className={tabClass(key === kind)}
              key={key}
              to={DOCUMENTS[key].path}
            >
              {DOCUMENTS[key].title}
            </Link>
          ))}
        </nav>
        <article className={`${CARD} p-4 sm:p-6`}>
          <h1 className="text-2xl font-black mb-2">{title}</h1>
          <p className="text-sm text-devin-gray font-medium mb-6">
            시행일: {EFFECTIVE_DATE} · 학습 목적으로 만든 팀 프로젝트의 정책입니다.
          </p>
          <nav aria-label="목차" className="mb-8 p-4 bg-devin-bg rounded-lg border-devin border-devin-ink text-sm">
            <p className="font-extrabold mb-2">목차</p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {sections.map((section, index) => (
                <li key={section.title}>
                  <a className={`rounded hover:underline ${FOCUS}`} href={`#${kind}-${index}`}>
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
          <div className="mt-10 pt-6 border-t-devin border-dashed border-devin-gray-light flex justify-center">
            <button
              className={buttonClass("secondary")}
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
                arrow_upward
              </span>
              맨 위로
            </button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
