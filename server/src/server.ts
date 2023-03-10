import WebSocket, { MessageEvent } from "ws";
import http from "http";
import express from "express";
import { Server as SocketIO } from "socket.io";
const PORT: number = 3000;
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
const path = require("path");
// app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "/public/dist")));

app.get("/", (req, res) => res.sendFile(__dirname, "/public/dist/index.html"));

const httpServer = http.createServer(app); // http 서버

const wsServer = new WebSocket.Server({ server: httpServer }); // ws(websocket) 서버
// 이렇게 함으로써 동일 포트에 http / ws 서버를 함께 구동
// 필수 사항은 아니며 ws 서버만 구동해도 무관

const sockets: ISocket[] = []; // this will be fake DB
wsServer.on("connection", (socket: ISocket, request: http.IncomingMessage) => {
  console.log("WS connected --- O");
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  socket.on("message", (msg: MessageEvent) => {
    try {
      const { nickname, message }: IWSMessage = JSON.parse(msg.toString());
      socket.nickname = nickname;
      sockets.forEach((socket) => {
        if (socket.nickname !== nickname) {
          socket.send(`${nickname}: ${message}`);
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("close", () => {
    console.log("WS disconnected --- X");
    // TODO remove socket from sockets
  });
});

const ioServer: SocketIO = new SocketIO(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
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
function getRoomParticipantsCount(roomName: string) {
  const {
    sockets: {
      adapter: { rooms },
    },
  } = ioServer;
  return rooms.get(roomName)?.size || 0;
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
    (
      { roomName }: IIORoomPayload,
      callback: (roomMemberCount: number, isAvailable: boolean) => void
    ) => {
      const roomParticipantsCount = getRoomParticipantsCount(roomName);
      if (roomParticipantsCount < 2) {
        socket.join(roomName);
        callback(roomParticipantsCount + 1, true);
        socket
          .to(roomName)
          .emit("joinRoom", getRoomParticipantsCount(roomName));
        ioServer.sockets.emit("roomChanged", getPublicRooms());
      } else {
        callback(roomParticipantsCount, false);
      }
    }
  );
  // before completely disconnect
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("leaveRoom", getRoomParticipantsCount(room) - 1)
    );
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
    (
      targetRoomName: string,
      currentRoomName: string,
      callback: (isAvailable: boolean) => void
    ) => {
      if (getRoomParticipantsCount(targetRoomName) < 2) {
        socket.leave(currentRoomName);
        socket.join(targetRoomName);
        socket
          .to(targetRoomName)
          .emit("joinRoom", getRoomParticipantsCount(targetRoomName));
        socket
          .to(currentRoomName)
          .emit("leaveRoom", getRoomParticipantsCount(currentRoomName) - 1);
        callback(true);
      } else {
        callback(false);
      }
    }
  );
  socket.on("offer", (offer: any, roomName: string) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer: any, roomName: string) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice: any, roomName: string) => {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("getRooms", (callback: (rooms: string[]) => void) => {
    callback(getPublicRooms());
  });
  socket.on(
    "getRoomParticipantsCount",
    (roomName, callback: (roomMemberCount: number) => void) => {
      callback(getRoomParticipantsCount(roomName));
    }
  );
});
httpServer.listen(PORT, () =>
  console.log(`Listening on PORT: http://localhost:${PORT}`)
);
