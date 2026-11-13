const tagRepository = require('./tag.repository');
const { RECOMMEND_MAX } = require('./tag.constants');

async function getTags(keyword) {
  return tagRepository.findTags(keyword);
}

async function getPopularTags(limit) {
  const rows = await tagRepository.findPopularTags(limit);
  return rows.map((row) => ({ tagId: row.tagId, name: row.name, questionCount: Number(row.questionCount) }));
}

async function getCategories() {
  return tagRepository.findCategories();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 태그 이름이 단어로 들어 있는 첫 위치. 앞뒤가 영문자·숫자면 다른 단어의 일부로 본다
// ("java"는 "javascript"에, "sql"은 "mysql"에 걸리지 않는다). 한글 조사가 붙은 "react를"은 찾는다.
function findWordIndex(text, name) {
  const match = new RegExp(`(?<![a-z0-9])${escapeRegExp(name)}(?![a-z0-9])`).exec(text);
  return match === null ? -1 : match.index;
}

// 추천 태그 (REQ-QUESTION-008). 제목·내용에 나온 태그를 먼저 나온 순서로 최대 8개 고른다.
// 태그는 seed.sql로 고정된 목록(수십 개)이라 모두 불러와 비교한다.
async function recommendTags({ title, content }) {
  const text = `${title}\n${content}`.toLowerCase();
  const tags = await tagRepository.findTags(null);
  const tagNames = tags
    .map(({ name }) => ({ name, index: findWordIndex(text, name.toLowerCase()) }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index || a.name.localeCompare(b.name))
    .slice(0, RECOMMEND_MAX)
    .map(({ name }) => name);
  return { tags: tagNames };
}

module.exports = { getTags, getPopularTags, getCategories, recommendTags };
