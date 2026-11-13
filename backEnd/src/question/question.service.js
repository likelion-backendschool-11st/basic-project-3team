const questionRepository = require('./question.repository');
const { getOffset, toPage } = require('../utils/page');

function groupTagsByQuestion(tagRows) {
  const tagsByQuestion = new Map();
  for (const { questionId, name } of tagRows) {
    if (!tagsByQuestion.has(questionId)) {
      tagsByQuestion.set(questionId, []);
    }
    tagsByQuestion.get(questionId).push(name);
  }
  return tagsByQuestion;
}

function toListItem(row, tags) {
  return {
    questionId: row.questionId,
    title: row.title,
    writer: { memberId: row.writerId, nickname: row.writerNickname },
    category: { categoryId: row.categoryId, name: row.categoryName },
    tags,
    accepted: Boolean(row.accepted),
    likeCount: row.likeCount,
    viewCount: row.viewCount,
    answerCount: Number(row.answerCount),
    createdAt: row.createdAt,
  };
}

// 질문 검색 (검색 결과 화면). condition의 조건을 모두 만족하는 질문을 page(0부터) 단위로 돌려준다.
async function searchQuestions({ page, size, sort, ...condition }) {
  const [rows, totalElements] = await Promise.all([
    questionRepository.searchQuestions(condition, { sort, limit: size, offset: getOffset(page, size) }),
    questionRepository.countQuestions(condition),
  ]);
  const tagRows = await questionRepository.findTagsByQuestionIds(rows.map((row) => row.questionId));
  const tagsByQuestion = groupTagsByQuestion(tagRows);

  const content = rows.map((row) => toListItem(row, tagsByQuestion.get(row.questionId) ?? []));
  return toPage(content, page, size, Number(totalElements));
}

module.exports = { searchQuestions };
