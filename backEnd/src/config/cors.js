// 다른 출처에서 접속을 허용할 프론트 주소 (.env의 CORS_ORIGIN, 쉼표로 여러 개)
// 예: CORS_ORIGIN=https://devin.vercel.app,https://devin-git-main-team.vercel.app
// 비어 있으면 다른 출처를 막는다. 개발 환경은 Vite 프록시로 같은 출처에서 접속하므로 비워 둔다.
// 배포에서 API 요청은 Vercel이 /api를 백엔드로 넘겨 같은 출처가 되고, 실시간 알림(socket.io)만 백엔드 주소로 바로 접속한다.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins : false;

module.exports = { corsOrigin };
