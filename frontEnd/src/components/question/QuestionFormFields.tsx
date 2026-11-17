// 질문하기·질문 수정이 같이 쓰는 입력칸: 제목, 카테고리, 마크다운 내용, 태그 (#188).
// 두 화면이 같은 모양이 되도록 한 곳에 두고, 화면마다 다른 것(템플릿 토글, 버튼)은 각 화면이 정한다.
import { useState, type ReactNode } from "react";
import { QUESTION_RULES as RULES } from "../../api/question";
import { useMarkdownToolbar, type MarkdownFormat } from "../../hooks/useMarkdownToolbar";
import { charLength, type useQuestionForm } from "../../hooks/useQuestionForm";
import { useCategories } from "../../hooks/useTagData";
import FieldError from "../FieldError";
import Markdown from "../markdown/Markdown";
import SortTabs from "../SortTabs";
import RecommendedTags from "../tag/RecommendedTags";
import { buttonClass, CHIP, INPUT, NOTICE } from "../uiStyles";

const TOOLBAR: { format: MarkdownFormat; icon: string; label: string }[] = [
  { format: "bold", icon: "format_bold", label: "굵게" },
  { format: "italic", icon: "format_italic", label: "기울임" },
  { format: "codeBlock", icon: "code", label: "코드 블록" },
  { format: "link", icon: "link", label: "링크" },
  { format: "image", icon: "image", label: "이미지" },
];

const MODE_TABS = [
  { value: "write", label: "작성" },
  { value: "preview", label: "미리보기" },
] as const;

export default function QuestionFormFields({
  form,
  beforeEditor,
  onContentInput,
}: {
  form: ReturnType<typeof useQuestionForm>;
  // 내용칸 위에 넣을 것 (질문하기의 템플릿 토글)
  beforeEditor?: ReactNode;
  // 내용칸에 직접 입력했을 때 (질문하기의 템플릿 안내 지우기)
  onContentInput?: () => void;
}) {
  const { values, tagInput, setTagInput, errors, formError, change, handleTagKeyDown, removeTag, toggleTag } = form;
  const categories = useCategories();
  // #62: 툴바는 내용칸에 마크다운 기호를 넣고, 미리보기는 상세 화면과 같은 모양으로 보여 준다.
  const toolbar = useMarkdownToolbar(values.content, (content) => change("content", content));
  const [mode, setMode] = useState<"write" | "preview">("write");
  const preview = mode === "preview";

  return (
    <div className="space-y-6">
      {formError && (
        <p className={NOTICE.error} role="alert">
          <span className="material-symbols-outlined text-[18px] leading-5" aria-hidden="true">
            error
          </span>
          {formError}
        </p>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label className={INPUT.label} htmlFor="question-title">
            제목
          </label>
          <span className="mb-1.5 text-xs text-devin-gray tabular-nums">
            {charLength(values.title.trim())} / {RULES.titleMax}
          </span>
        </div>
        <input
          className={`${INPUT.base} ${errors.title ? INPUT.error : ""}`}
          id="question-title"
          placeholder={`제목을 입력해 주세요 (${RULES.titleMin}~${RULES.titleMax}자)`}
          type="text"
          value={values.title}
          onChange={(e) => change("title", e.target.value)}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label className={INPUT.label} htmlFor="question-category">
          카테고리
        </label>
        <select
          className={`${INPUT.base} ${errors.categoryId ? INPUT.error : ""} cursor-pointer`}
          id="question-category"
          value={values.categoryId}
          onChange={(e) => change("categoryId", e.target.value)}
        >
          <option value="">카테고리를 골라 주세요</option>
          {categories.map(({ categoryId: id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <FieldError message={errors.categoryId} />
      </div>

      {beforeEditor}

      <div>
        <label className={INPUT.label} htmlFor="question-content">
          내용
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {TOOLBAR.map(({ format, icon, label }) => (
              <button
                key={format}
                aria-label={label}
                className={`${buttonClass("secondary", "sm")} w-8 px-0`}
                disabled={preview}
                title={label}
                type="button"
                onClick={() => toolbar.apply(format)}
              >
                <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
                  {icon}
                </span>
              </button>
            ))}
          </div>
          <SortTabs tabs={MODE_TABS} value={mode} onChange={setMode} label="내용 작성 방식" />
        </div>
        {preview && (
          <div
            className="min-h-[300px] px-3 py-2.5 bg-devin-paper border-devin border-devin-ink rounded-lg text-sm"
            data-purpose="markdown-preview"
          >
            {values.content.trim() ? (
              <Markdown content={values.content} />
            ) : (
              <p className="text-devin-gray">미리 볼 내용이 없어요.</p>
            )}
          </div>
        )}
        <textarea
          ref={toolbar.textareaRef}
          hidden={preview}
          className={`${INPUT.box} ${errors.content ? INPUT.error : ""} font-mono leading-relaxed resize-y`}
          id="question-content"
          placeholder="질문 내용을 자세하게 적어 주세요 (마크다운 지원)"
          rows={15}
          value={values.content}
          onChange={(e) => {
            change("content", e.target.value);
            onContentInput?.();
          }}
        />
        <FieldError message={errors.content} />
      </div>

      <div>
        <label className={INPUT.label} htmlFor="question-tags">
          태그 (선택)
        </label>
        {values.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {values.tags.map((tag) => (
              <span key={tag} className={CHIP.removable}>
                {tag}
                <button
                  aria-label={`${tag} 태그 지우기`}
                  className={CHIP.remove}
                  type="button"
                  onClick={() => removeTag(tag)}
                >
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                    close
                  </span>
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          className={`${INPUT.base} ${errors.tags ? INPUT.error : ""}`}
          id="question-tags"
          placeholder={`태그를 입력하고 Enter를 눌러 주세요 (최대 ${RULES.maxTags}개)`}
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
        />
        {errors.tags ? (
          <FieldError message={errors.tags} />
        ) : (
          <p className={INPUT.hint}>질문과 관련된 기술 스택 태그를 붙일 수 있어요.</p>
        )}
        {/* #61: 제목·내용 기반 추천 태그. 누르면 추가, 다시 누르면 제거 */}
        <div className="mt-2">
          <RecommendedTags title={values.title} content={values.content} selected={values.tags} onToggle={toggleTag} />
        </div>
      </div>
    </div>
  );
}
