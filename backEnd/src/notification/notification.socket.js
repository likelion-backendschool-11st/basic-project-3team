const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { corsOrigin } = require('../config/cors');
const { memberRoom, NOTIFICATION_EVENT } = require('./notification.constants');

// 실시간 알림 (docs/api.md 9장 실시간 전송)
// 클라이언트는 io({ auth: { token: accessToken } })으로 접속한다. 토큰이 맞으면 member:{memberId} 방에 넣는다.
let io = null;

function initNotificationSocket(httpServer) {
  io = new Server(httpServer, {
    // 개발 환경은 Vite 프록시로 같은 출처에서 접속한다.
    // 배포에서는 Vercel이 WebSocket을 넘기지 않으므로 프론트가 백엔드 주소로 바로 접속한다.
    // 이 cors 값(.env의 CORS_ORIGIN)은 HTTP 요청(polling)에만 적용된다. 프론트는 websocket으로만 접속하고 출처와 관계없이
    // 아래의 Access Token 확인으로 막는다.
    cors: { origin: corsOrigin },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('UNAUTHORIZED'));
    }
    try {
      const { memberId } = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.memberId = memberId;
      return next();
    } catch (err) {
      return next(new Error(err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(memberRoom(socket.data.memberId));
  });

  return io;
}

// 접속 중인 받는 사람에게 바로 보낸다. 서버가 socket 없이 실행 중이면(테스트 등) 아무것도 하지 않는다.
function emitNotification(memberId, notification) {
  io?.to(memberRoom(memberId)).emit(NOTIFICATION_EVENT, notification);
}

module.exports = { initNotificationSocket, emitNotification };
