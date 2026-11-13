const mainRepository = require('./main.repository');
const { toPage } = require('../utils/page');

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

// 질문 목록 (메인 화면 인기순·최신순 등). page는 0부터 시작한다.
async function getQuestions({ page, size, sort }) {
  const [rows, totalElements] = await Promise.all([
    mainRepository.findQuestions({ sort, limit: size, offset: page * size }),
    mainRepository.countQuestions(),
  ]);
  const tagRows = await mainRepository.findTagsByQuestionIds(rows.map((row) => row.questionId));
  const tagsByQuestion = groupTagsByQuestion(tagRows);

  const content = rows.map((row) => toListItem(row, tagsByQuestion.get(row.questionId) ?? []));
  return toPage(content, page, size, Number(totalElements));
}

module.exports = { getQuestions };
