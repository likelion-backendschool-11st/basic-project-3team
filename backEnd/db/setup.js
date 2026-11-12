const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const NAME_PATTERN = /^[A-Za-z0-9_]+$/;
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const SEED_FILE = path.join(__dirname, 'seed.sql');

function readEnv() {
  const env = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
  const missing = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`backEnd/.env에 ${missing.join(', ')} 값이 없습니다. .env.example을 참고하세요.`);
  }
  if (!NAME_PATTERN.test(env.database) || !NAME_PATTERN.test(env.user)) {
    throw new Error('DB_NAME, DB_USER에는 영문·숫자·_만 쓸 수 있습니다.');
  }
  return env;
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let prompted = false;
    rl._writeToOutput = (text) => {
      if (!prompted) {
        rl.output.write(text);
        prompted = true;
      }
    };
    rl.question(question, (answer) => {
      rl.output.write('\n');
      rl.close();
      resolve(answer);
    });
  });
}

async function createDatabaseAndUser(env) {
  const rootUser = process.env.DB_ROOT_USER || 'root';
  const rootPassword = process.env.DB_ROOT_PASSWORD ?? (await askHidden(`MySQL ${rootUser} 비밀번호: `));

  const conn = await mysql.createConnection({
    host: env.host,
    port: env.port,
    user: rootUser,
    password: rootPassword,
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
    );
    await conn.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [env.user, 'localhost', env.password]);
    await conn.query('ALTER USER ?@? IDENTIFIED BY ?', [env.user, 'localhost', env.password]);
    await conn.query(`GRANT ALL PRIVILEGES ON \`${env.database}\`.* TO ?@?`, [env.user, 'localhost']);
    console.log(`데이터베이스 ${env.database}, 계정 ${env.user}@localhost 준비 완료`);
  } finally {
    await conn.end();
  }
}

async function loadSqlFiles(env, files) {
  const conn = await mysql.createConnection({
    host: env.host,
    port: env.port,
    user: env.user,
    password: env.password,
    database: env.database,
    charset: 'utf8mb4',
    timezone: '+09:00',
    multipleStatements: true,
  });
  try {
    for (const file of files) {
      await conn.query(fs.readFileSync(file, 'utf8'));
      console.log(`${path.basename(file)} 실행 완료`);
    }
  } finally {
    await conn.end();
  }
}

async function main() {
  const mode = process.argv[2];
  if (!['setup', 'reset', 'schema'].includes(mode)) {
    console.log('사용법: node db/setup.js <setup|reset|schema>');
    console.log('  setup  : DB·계정 생성(관리자 비밀번호 필요) 후 schema.sql, seed.sql 실행');
    console.log('  reset  : 테이블을 지우고 schema.sql, seed.sql 다시 실행');
    console.log('  schema : 테이블만 다시 만들고 데이터는 넣지 않음');
    process.exitCode = 1;
    return;
  }

  const env = readEnv();
  if (mode === 'setup') {
    await createDatabaseAndUser(env);
  }
  const files = mode === 'schema' ? [SCHEMA_FILE] : [SCHEMA_FILE, SEED_FILE];
  await loadSqlFiles(env, files);
}

main().catch((err) => {
  console.error(`실패: ${err.message}`);
  process.exitCode = 1;
});
