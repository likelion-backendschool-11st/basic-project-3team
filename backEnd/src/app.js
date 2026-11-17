const http = require('node:http');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { corsOrigin } = require('./config/cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');
const ErrorCode = require('./utils/errorCode');
const { initNotificationSocket } = require('./notification/notification.socket');

const app = express();

// 허용한 프론트 주소만 다른 출처 요청을 받고, Refresh 쿠키가 오가도록 credentials를 허용한다 (#75)
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
// Refresh Token 쿠키를 읽는다 (docs/auth.md)
app.use(cookieParser());

app.use('/api', routes);

app.use((req, res, next) => {
  next(new AppError(ErrorCode.API_NOT_FOUND));
});

app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  // socket.io(실시간 알림)가 같은 포트를 쓰도록 http 서버를 직접 만든다 (docs/api.md 9장).
  const server = http.createServer(app);
  initNotificationSocket(server);
  server.listen(port, () => {
    console.log(`Dev in API server listening on port ${port}`);
  });
}

module.exports = app;
