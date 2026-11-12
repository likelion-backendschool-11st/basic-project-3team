-- Dev in 팀 공통 테스트 데이터 (로컬 개발용)
-- 사용법: schema.sql 실행 후 mysql -u {DB_USER} -p {DB_NAME} < backEnd/db/seed.sql
-- 회원 비밀번호는 bcrypt 해시만 넣는다. 테스트 계정 비밀번호는 팀 내부에서 따로 공유한다.
-- like_count, accepted_answer_id 등 집계·채택 값은 아래 좋아요·답변 데이터와 맞춰 두었다.

SET NAMES utf8mb4;

-- 카테고리 7개 (고정)
INSERT INTO category (category_id, name, sort_order) VALUES
  (1, '백엔드', 1),
  (2, '프론트엔드', 2),
  (3, '모바일', 3),
  (4, '데이터베이스', 4),
  (5, 'DevOps·인프라', 5),
  (6, 'AI·데이터', 6),
  (7, '기타', 7);

-- 태그 (소문자)
INSERT INTO tag (name) VALUES
  ('java'), ('spring'), ('jpa'), ('kotlin'),
  ('javascript'), ('typescript'), ('react'), ('vue'), ('nextjs'), ('vite'), ('html'), ('css'), ('tailwindcss'),
  ('nodejs'), ('express'), ('axios'), ('jwt'),
  ('python'), ('django'), ('pandas'), ('pytorch'),
  ('mysql'), ('sql'), ('redis'),
  ('docker'), ('kubernetes'), ('aws'), ('linux'), ('git'),
  ('android'), ('swift'), ('flutter');

-- 회원
-- 1: 관리자, 2~4: 일반 회원, 5: 정지 회원
INSERT INTO member (member_id, login_id, password_hash, phone, nickname, bio, career_years, role, status,
                    notification_enabled, created_at) VALUES
  (1, 'admin_devin', '$2a$10$eDFXVrQasj6wUpiOh9xS0.uK5.5fD5PBvahJK98HctWS.an0Iwy6u', '01000000000', '관리자',
   NULL, NULL, 'ROLE_ADMIN', 'ACTIVE', FALSE, '2026-11-01 09:00:00'),
  (2, 'devin_user1', '$2a$10$SuxOTv9J1Cuw48wykDRwfeGI.xmuJhDrz4HefM1tSSnLRNmzbjRgm', '01011112222', '자바왕',
   '스프링 백엔드 3년 차입니다.', 3, 'ROLE_USER', 'ACTIVE', TRUE, '2026-11-01 10:00:00'),
  (3, 'devin_user2', '$2a$10$SuxOTv9J1Cuw48wykDRwfeGI.xmuJhDrz4HefM1tSSnLRNmzbjRgm', '01033334444', '리액트러',
   '프론트엔드 개발자예요.', 1, 'ROLE_USER', 'ACTIVE', TRUE, '2026-11-02 10:00:00'),
  (4, 'devin_user3', '$2a$10$SuxOTv9J1Cuw48wykDRwfeGI.xmuJhDrz4HefM1tSSnLRNmzbjRgm', '01055556666', '신입개발자',
   NULL, 0, 'ROLE_USER', 'ACTIVE', TRUE, '2026-11-03 10:00:00'),
  (5, 'banned_user', '$2a$10$SuxOTv9J1Cuw48wykDRwfeGI.xmuJhDrz4HefM1tSSnLRNmzbjRgm', '01077778888', '정지회원',
   NULL, NULL, 'ROLE_USER', 'BANNED', TRUE, '2026-11-04 10:00:00');

INSERT INTO member_tech_stack (member_id, tag_id)
SELECT 2, tag_id FROM tag WHERE name IN ('java', 'spring', 'jpa', 'mysql');
INSERT INTO member_tech_stack (member_id, tag_id)
SELECT 3, tag_id FROM tag WHERE name IN ('react', 'typescript', 'vite');

-- 관심 카테고리
INSERT INTO member_category (member_id, category_id) VALUES
  (2, 1), (2, 4),
  (3, 2),
  (4, 1), (4, 5);

-- 질문
-- 1: 채택됨(답변 1), 2: 답변 2개·미채택, 3: 채택됨(답변 4), 4: 답변 없음, 5: 신고로 삭제됨, 6: 답변 1개·미채택
INSERT INTO question (question_id, member_id, category_id, title, content, view_count, like_count,
                      deleted, deleted_at, created_at) VALUES
  (1, 4, 1, 'JPA N+1 문제 해결 방법',
   '## 개발 환경\nSpring Boot 3, Spring Data JPA\n\n## 문제\n게시글 목록을 조회하면 댓글 수만큼 쿼리가 추가로 나갑니다.\n\n```java\nList<Post> posts = postRepository.findAll();\n```\n\n## 기대 결과\n쿼리 한 번으로 조회하고 싶습니다.',
   42, 2, FALSE, NULL, '2026-11-05 10:00:00'),
  (2, 3, 2, 'React useEffect가 두 번 실행돼요',
   '개발 모드에서 컴포넌트가 처음 그려질 때 useEffect 안의 API 호출이 두 번 나갑니다.\n\n```jsx\nuseEffect(() => {\n  fetchQuestions();\n}, []);\n```\n\n배포하면 괜찮은지 궁금합니다.',
   30, 2, FALSE, NULL, '2026-11-06 11:00:00'),
  (3, 2, 4, 'MySQL에서 인덱스가 안 타는 이유',
   'created_at에 인덱스를 걸었는데 EXPLAIN을 보면 풀 스캔을 합니다.\n\n```sql\nSELECT * FROM question WHERE DATE(created_at) = ''2026-11-01'';\n```',
   25, 1, FALSE, NULL, '2026-11-07 09:30:00'),
  (4, 4, 5, 'Docker 컨테이너에서 localhost 접속이 안 돼요',
   '컨테이너 안의 Node 서버에서 호스트의 MySQL에 localhost:3306으로 접속하면 연결이 거부됩니다. 어떻게 접속해야 하나요?',
   8, 0, FALSE, NULL, '2026-11-08 14:00:00'),
  (5, 5, 7, '무료 코딩 강의 사이트 홍보합니다',
   '지금 가입하면 모든 강의가 무료! 아래 링크로 들어오세요. 질문과 관계없는 홍보 글입니다.',
   3, 0, TRUE, '2026-11-09 18:00:00', '2026-11-09 12:00:00'),
  (6, 3, 2, 'axios 인터셉터로 토큰 재발급하기',
   '401 응답이 오면 재발급 API를 부르고 원래 요청을 다시 보내고 싶습니다. 요청이 여러 개 동시에 실패하면 재발급이 여러 번 호출되는데 어떻게 막나요?',
   15, 1, FALSE, NULL, '2026-11-10 16:00:00');

INSERT INTO question_tag (question_id, tag_id) SELECT 1, tag_id FROM tag WHERE name IN ('java', 'spring', 'jpa');
INSERT INTO question_tag (question_id, tag_id) SELECT 2, tag_id FROM tag WHERE name IN ('react', 'javascript');
INSERT INTO question_tag (question_id, tag_id) SELECT 3, tag_id FROM tag WHERE name IN ('mysql', 'sql');
INSERT INTO question_tag (question_id, tag_id) SELECT 4, tag_id FROM tag WHERE name IN ('docker', 'linux', 'mysql');
INSERT INTO question_tag (question_id, tag_id) SELECT 6, tag_id FROM tag WHERE name IN ('react', 'axios', 'jwt');

-- 답변
INSERT INTO answer (answer_id, question_id, member_id, content, like_count, created_at) VALUES
  (1, 1, 2,
   'fetch join이나 @EntityGraph를 쓰면 됩니다.\n\n```java\n@Query("select p from Post p join fetch p.comments")\nList<Post> findAllWithComments();\n```\n\n페이징이 필요하면 batch size 설정을 함께 보세요.',
   2, '2026-11-05 11:00:00'),
  (2, 2, 2,
   'React 18부터 StrictMode가 개발 모드에서 effect를 일부러 두 번 실행합니다. 배포 빌드에서는 한 번만 실행됩니다.',
   1, '2026-11-06 12:00:00'),
  (3, 2, 4,
   'main.jsx에서 StrictMode를 지우면 한 번만 실행되는 것을 확인했어요.',
   1, '2026-11-06 13:00:00'),
  (4, 3, 3,
   '컬럼에 DATE() 같은 함수를 씌우면 인덱스를 쓸 수 없습니다. 범위 조건으로 바꿔 보세요.\n\n```sql\nWHERE created_at >= ''2026-11-01'' AND created_at < ''2026-11-02''\n```',
   2, '2026-11-07 10:00:00'),
  (5, 6, 2,
   '재발급 요청을 Promise 하나로 저장해 두고, 진행 중이면 그 Promise를 기다리게 하면 한 번만 호출됩니다.',
   0, '2026-11-10 17:00:00');

-- 채택
UPDATE question SET accepted_answer_id = 1, accepted_at = '2026-11-05 15:00:00' WHERE question_id = 1;
UPDATE question SET accepted_answer_id = 4, accepted_at = '2026-11-07 12:00:00' WHERE question_id = 3;

-- 답글
INSERT INTO reply (answer_id, member_id, content, created_at) VALUES
  (1, 4, '감사합니다! fetch join으로 해결했어요.', '2026-11-05 14:00:00'),
  (1, 2, '해결돼서 다행이에요.', '2026-11-05 14:30:00'),
  (2, 3, '배포 환경에서는 한 번만 호출되는 것 확인했습니다.', '2026-11-06 15:00:00');

-- 좋아요 (본인 글 제외, 위 like_count와 개수가 같아야 한다)
INSERT INTO question_like (member_id, question_id) VALUES
  (2, 1), (3, 1),
  (2, 2), (4, 2),
  (4, 3),
  (4, 6);

INSERT INTO answer_like (member_id, answer_id) VALUES
  (3, 1), (4, 1),
  (3, 2),
  (3, 3),
  (2, 4), (4, 4);

-- 신고
-- 질문 5: 두 건 모두 관리자가 DELETE_TARGET으로 처리, 답변 3: 처리 대기
INSERT INTO report (reporter_id, target_type, target_id, reason, reason_detail, status, processed_by, processed_at,
                    created_at) VALUES
  (2, 'QUESTION', 5, 'SPAM', NULL, 'RESOLVED', 1, '2026-11-09 18:00:00', '2026-11-09 13:00:00'),
  (3, 'QUESTION', 5, 'SPAM', NULL, 'RESOLVED', 1, '2026-11-09 18:00:00', '2026-11-09 13:30:00'),
  (2, 'ANSWER', 3, 'ETC', '해결 방법이 아니라 StrictMode를 끄는 우회 방법입니다.', 'PENDING', NULL, NULL,
   '2026-11-06 16:00:00');

-- 알림
INSERT INTO notification (member_id, type, message, question_id, is_read, created_at) VALUES
  (2, 'CATEGORY_QUESTION', '관심 카테고리 ''백엔드''에 새 질문이 올라왔습니다: JPA N+1 문제 해결 방법', 1, TRUE,
   '2026-11-05 10:00:00'),
  (4, 'ANSWER_CREATED', '''JPA N+1 문제 해결 방법''에 새 답변이 달렸습니다.', 1, TRUE, '2026-11-05 11:00:00'),
  (2, 'ANSWER_ACCEPTED', '''JPA N+1 문제 해결 방법''에 단 답변이 채택되었습니다.', 1, TRUE, '2026-11-05 15:00:00'),
  (3, 'ANSWER_CREATED', '''React useEffect가 두 번 실행돼요''에 새 답변이 달렸습니다.', 2, TRUE,
   '2026-11-06 12:00:00'),
  (3, 'ANSWER_CREATED', '''React useEffect가 두 번 실행돼요''에 새 답변이 달렸습니다.', 2, FALSE,
   '2026-11-06 13:00:00'),
  (2, 'ANSWER_CREATED', '''MySQL에서 인덱스가 안 타는 이유''에 새 답변이 달렸습니다.', 3, FALSE,
   '2026-11-07 10:00:00'),
  (3, 'ANSWER_ACCEPTED', '''MySQL에서 인덱스가 안 타는 이유''에 단 답변이 채택되었습니다.', 3, FALSE,
   '2026-11-07 12:00:00'),
  (3, 'ANSWER_CREATED', '''axios 인터셉터로 토큰 재발급하기''에 새 답변이 달렸습니다.', 6, FALSE,
   '2026-11-10 17:00:00');
