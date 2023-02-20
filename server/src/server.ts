import WebSocket, { MessageEvent } from "ws";
import http from "http";
import express from "express";

const PORT: number = 3000;
const app: express.Application = express();

app.get("/", (req, res) => res.sendStatus(200));

const server = http.createServer(app); // http 서버
const wss = new WebSocket.Server({ server }); // ws(websocket) 서버
// 이렇게 함으로써 동일 포트에 http / ws 서버를 함께 구동
// 필수 사항은 아니며 ws 서버만 구동해도 무관

const sockets: WebSocket[] = []; // this will be fake DB

wss.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {
  console.log("connected --- O");
  sockets.push(socket);
  socket.send("hello~");
  socket.on("message", (message: MessageEvent) => {
    sockets.forEach((socket) => {
      socket.send(message.toString());
    });
  });
  socket.on("close", () => {
    console.log("disconnected --- X");
  });
});
server.listen(PORT, () =>
  console.log(`Listening on PORT: http://localhost:${PORT}`)
);
