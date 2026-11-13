-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS devinDB
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. 애플리케이션 전용 계정 생성
CREATE USER IF NOT EXISTS 'devin'@'localhost'
    IDENTIFIED BY 'devin';

-- 3. qna_board에 데이터 조회, 추가, 수정, 삭제 권한만 부여
GRANT ALL PRIVILEGES ON devinDB.* TO 'devin'@'localhost';

-- 4. 확인
SHOW GRANTS FOR 'devinDB'@'localhost';
