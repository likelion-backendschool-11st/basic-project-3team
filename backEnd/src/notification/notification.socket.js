const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { memberRoom, NOTIFICATION_EVENT } = require('./notification.constants');

// 실시간 알림 (docs/api.md 9장 실시간 전송)
// 클라이언트는 io({ auth: { token: accessToken } })으로 접속한다. 토큰이 맞으면 member:{memberId} 방에 넣는다.
let io = null;

function initNotificationSocket(httpServer) {
  io = new Server(httpServer, {
    // 개발 환경은 Vite 프록시로 같은 출처에서 접속한다. 배포 시 다른 출처면 여기에 허용 출처를 넣는다.
    cors: { origin: false },
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
