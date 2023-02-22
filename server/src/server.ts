import WebSocket, { MessageEvent } from "ws";
import http from "http";
import express from "express";
import { Server as SocketIO } from "socket.io";
const WS_PORT: number = 3000;
const IO_PORT: number = 3001;
interface IData {
  message: string;
  nickname: string;
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
    const { nickname, message }: IData = JSON.parse(msg.toString());
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
ioServer.on("connection", (socket) => {
  console.log("IO connected --- O");
  socket.on("disconnect", () => {
    console.log("IO disconnected --- X");
  });
  socket.on(
    "enterRoom",
    ({ roomName }: IIORoomPayload, callback: () => void) => {
      socket.join(roomName);
      callback();
      socket.to(roomName).emit("joinRoom");
    }
  );
  // before completely disconnect
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("leaveRoom"));
  });
});
httpServerForWS.listen(WS_PORT, () =>
  console.log(`Listening on PORT: http://localhost:${WS_PORT}`)
);
httpServerForIO.listen(IO_PORT, () =>
  console.log(`Listening on PORT: http://localhost:${IO_PORT}`)
);
