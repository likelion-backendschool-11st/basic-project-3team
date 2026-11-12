# Claude 작업 규칙 — Dev in

- 새 기능은 `docs/environment.md`의 디렉터리 구조와 `docs/convention.md`의 레이어 규칙을 따른다.
- API를 추가하거나 변경하면 `docs/api.md`도 함께 수정한다.
- 테이블을 바꾸면 `backEnd/db/schema.sql`과 DB 명세서를 함께 수정한다.
- 비밀번호, DB 접속 정보, JWT 비밀키 등 민감한 값은 코드에 넣지 않는다 (`.env`).
- API를 구현하면 Postman으로 동작을 확인하고 팀 컬렉션에 추가한다.
- `TODO`로 표시된 항목은 임의로 정하지 말고 먼저 확인을 요청한다.
