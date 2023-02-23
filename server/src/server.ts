import WebSocket, { MessageEvent } from "ws";
import http from "http";
import express from "express";
import { Server as SocketIO } from "socket.io";
const WS_PORT: number = 3000;
const IO_PORT: number = 3001;
interface IWSMessage {
  message: string;
  nickname: string;
}
interface IIOMessage extends IWSMessage {
  roomName: string;
}
interface ISocket extends WebSocket {
  nickname: string;
}
interface IIORoomPayload {
  roomName: string;
}
const app: express.Application = express();

app.get("/", (req, res) => res.sendStatus(200));

const httpServerForWS = http.createServer(app); // http 서버
const httpServerForIO = http.createServer(app); // http 서버

const wsServer = new WebSocket.Server({ server: httpServerForWS }); // ws(websocket) 서버
// 이렇게 함으로써 동일 포트에 http / ws 서버를 함께 구동
// 필수 사항은 아니며 ws 서버만 구동해도 무관

const sockets: ISocket[] = []; // this will be fake DB
wsServer.on("connection", (socket: ISocket, request: http.IncomingMessage) => {
  console.log("WS connected --- O");
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  socket.on("message", (msg: MessageEvent) => {
    const { nickname, message }: IWSMessage = JSON.parse(msg.toString());
    socket.nickname = nickname;
    sockets.forEach((socket) => {
      if (socket.nickname !== nickname) {
        socket.send(`${nickname}: ${message}`);
      }
    });
  });
  socket.on("close", () => {
    console.log("WS disconnected --- X");
    // TODO remove socket from sockets
  });
});

const ioServer: SocketIO = new SocketIO(httpServerForIO, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
function getPublicRooms() {
  const {
    sockets: {
      adapter: { rooms, sids: socketIds },
    },
  } = ioServer;
  const publicRooms: string[] = [];
  rooms.forEach((_, key) => {
    if (socketIds.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
ioServer.on("connection", (socket) => {
  console.log("IO connected --- O");
  ioServer.sockets.emit("roomChanged", getPublicRooms());
  socket.on("disconnect", () => {
    console.log("IO disconnected --- X");
    ioServer.sockets.emit("roomChanged", getPublicRooms());
  });
  socket.on(
    "enterRoom",
    ({ roomName }: IIORoomPayload, callback: () => void) => {
      socket.join(roomName);
      callback();
      socket.to(roomName).emit("joinRoom");
      ioServer.sockets.emit("roomChanged", getPublicRooms());
    }
  );
  // before completely disconnect
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("leaveRoom"));
  });
  socket.on(
    "message",
    ({ message, nickname, roomName }: IIOMessage, callback: () => void) => {
      socket.to(roomName).emit("message", `${nickname}: ${message}`);
      callback();
    }
  );
  socket.on(
    "moveRoom",
    (targetRoomName: string, currentRoomName: string, callback: () => void) => {
      socket.leave(currentRoomName);
      socket.join(targetRoomName);
      socket.to(targetRoomName).emit("joinRoom");
      socket.to(currentRoomName).emit("leaveRoom");
      callback();
    }
  );
  socket.on("getRooms", (callback: (rooms: string[]) => void) => {
    callback(getPublicRooms());
  });
});
httpServerForWS.listen(WS_PORT, () =>
  console.log(`Listening on PORT: http://localhost:${WS_PORT}`)
);
httpServerForIO.listen(IO_PORT, () =>
  console.log(`Listening on PORT: http://localhost:${IO_PORT}`)
);
