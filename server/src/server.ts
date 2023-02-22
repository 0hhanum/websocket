import WebSocket, { MessageEvent } from "ws";
import http from "http";
import express from "express";
import { Server as SocketIO } from "socket.io";
const PORT: number = 3000;
interface IData {
  message: string;
  nickname: string;
}
interface ISocket extends WebSocket {
  nickname: string;
}
const app: express.Application = express();

app.get("/", (req, res) => res.sendStatus(200));

const httpServer = http.createServer(app); // http 서버

const wsServer = new WebSocket.Server({ server: httpServer }); // ws(websocket) 서버
// 이렇게 함으로써 동일 포트에 http / ws 서버를 함께 구동
// 필수 사항은 아니며 ws 서버만 구동해도 무관

const sockets: ISocket[] = []; // this will be fake DB
wsServer.on("connection", (socket: ISocket, request: http.IncomingMessage) => {
  console.log("connected --- O");
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  socket.send("hello~");
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
    console.log("disconnected --- X");
    // TODO remove socket from sockets
  });
});

const ioServer = new SocketIO(httpServer);
ioServer.on("connection", (socket) => {
  console.log(socket);
});
httpServer.listen(PORT, () =>
  console.log(`Listening on PORT: http://localhost:${PORT}`)
);
