// docs/api.md 1장 페이징 응답 형식
function toPage(content, page, size, totalElements) {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
  };
}

module.exports = { toPage };
