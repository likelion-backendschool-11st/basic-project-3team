// SQL 작성 공통 함수

// LIKE의 와일드카드(%, _)와 이스케이프 문자(\)를 일반 문자로 바꾼다.
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

module.exports = { escapeLike };
