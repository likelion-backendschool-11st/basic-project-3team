import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, getFieldErrors } from "../api/client";
import { QUESTION_RULES as RULES, type QuestionRequest } from "../api/question";
import { useAuth } from "./useAuth";

export type QuestionField = "title" | "content" | "categoryId" | "tags";

// categoryId는 <select> 값이라 문자열로 들고 있다가 보낼 때 숫자로 바꾼다. ""이면 선택 안 함.
export interface QuestionValues {
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
}

const EMPTY: QuestionValues = { title: "", content: "", categoryId: "", tags: [] };

// 서버와 같게 이모지 등도 1자로 센다.
export const charLength = (value: string) => [...value].length;

// 서버(board.controller.js)와 같은 규칙으로 먼저 검사한다 (REQ-QUESTION-004).
function validate({ title, content, categoryId, tags }: QuestionValues) {
  const errors: Partial<Record<QuestionField, string>> = {};
  const titleLength = charLength(title.trim());
  if (titleLength < RULES.titleMin) errors.title = `제목은 ${RULES.titleMin}자 이상 입력해주세요.`;
  else if (titleLength > RULES.titleMax) errors.title = `제목은 ${RULES.titleMax}자 이하로 입력해주세요.`;
  if (charLength(content.trim()) < RULES.contentMin) errors.content = `내용은 ${RULES.contentMin}자 이상 입력해주세요.`;
  else if (charLength(content) > RULES.contentMax)
    errors.content = `내용은 ${RULES.contentMax.toLocaleString()}자 이하로 입력해주세요.`;
  if (categoryId === "") errors.categoryId = "카테고리를 1개 선택해주세요.";
  if (tags.length > RULES.maxTags) errors.tags = `태그는 최대 ${RULES.maxTags}개까지 선택할 수 있습니다.`;
  return errors;
}

// 질문하기·질문 수정 화면이 함께 쓰는 입력 상태, 검사, 태그 입력, 서버 에러 처리.
// 둘 다 회원만 쓸 수 있으므로 로그인하지 않았으면 로그인 화면으로 보낸다.
export function useQuestionForm() {
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [values, setValues] = useState<QuestionValues>(EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<QuestionField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 새로고침 직후 로그인 복구(initializing)가 끝난 뒤 판단한다.
  useEffect(() => {
    if (!initializing && !user) navigate("/login", { replace: true });
  }, [initializing, user, navigate]);

  function clearError(field: QuestionField) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  }

  function change(field: "title" | "content" | "categoryId", value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  }

  // Enter로 태그 추가. 서버처럼 소문자로 바꾸고 중복은 넣지 않는다. 한글 조합 중 Enter는 무시한다.
  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag === "") return;
    const { tags } = values;
    if (tags.length >= RULES.maxTags && !tags.includes(tag)) {
      setErrors((prev) => ({ ...prev, tags: `태그는 최대 ${RULES.maxTags}개까지 선택할 수 있습니다.` }));
      return;
    }
    if (!tags.includes(tag)) setValues((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
    clearError("tags");
  }

  function removeTag(tag: string) {
    setValues((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    clearError("tags");
  }

  // 검사를 통과하면 send를 부른다. 실패하면 400은 입력칸별로, 그 외는 폼 위 문구로 보여 준다.
  async function submit(send: (request: QuestionRequest) => Promise<void>) {
    if (submitting) return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await send({
        title: values.title.trim(),
        content: values.content,
        categoryId: Number(values.categoryId),
        tags: values.tags,
      });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors.length > 0) {
        setErrors(Object.fromEntries(fieldErrors.map(({ field, reason }) => [field, reason])));
      } else {
        setFormError(getErrorMessage(err));
      }
      setSubmitting(false);
    }
  }

  return {
    user,
    initializing,
    values,
    reset: setValues,
    tagInput,
    setTagInput,
    errors,
    formError,
    submitting,
    change,
    handleTagKeyDown,
    removeTag,
    submit,
  };
}
