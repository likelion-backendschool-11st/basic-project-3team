-- Dev in DB·계정 생성 스크립트 (MySQL Workbench 등에서 root 계정으로 직접 실행)
-- npm run db:setup 의 DB·계정 생성 단계와 같은 일을 한다.
--
-- 사용법
--   1. 아래 SET @devin_password = ''; 의 따옴표 안에 backEnd/.env의 DB_PASSWORD와 같은 값을 넣는다.
--   2. root 계정으로 접속해 스크립트 전체를 실행한다. (Workbench: Ctrl + Shift + Enter)
--   3. 실행한 뒤 비밀번호를 다시 '' 로 지우고 저장한다. 비밀번호를 넣은 채로 커밋하지 않는다.
--   4. 테이블과 데이터는 schema.sql, seed.sql 순서로 실행하거나 npm run db:reset 으로 넣는다.
--
-- 비밀번호를 비워 둔 채 실행하면 테이블 '먼저_devin_password를_입력하세요'가 없다는 오류를 내고 멈춘다.

SET @devin_password = '';

SET @guard = IF(@devin_password = '', 'SELECT * FROM mysql.`먼저_devin_password를_입력하세요`', 'DO 0');
PREPARE stmt FROM @guard;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE DATABASE IF NOT EXISTS devinDB CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 계정이 없으면 만들고, 이미 있으면 비밀번호를 @devin_password로 바꾼다.
SET @create_user = CONCAT('CREATE USER IF NOT EXISTS ''devin''@''localhost'' IDENTIFIED BY ', QUOTE(@devin_password));
PREPARE stmt FROM @create_user;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @alter_user = CONCAT('ALTER USER ''devin''@''localhost'' IDENTIFIED BY ', QUOTE(@devin_password));
PREPARE stmt FROM @alter_user;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

GRANT ALL PRIVILEGES ON devinDB.* TO 'devin'@'localhost';

SET @devin_password = NULL;
SET @create_user = NULL;
SET @alter_user = NULL;

SHOW GRANTS FOR 'devin'@'localhost';
