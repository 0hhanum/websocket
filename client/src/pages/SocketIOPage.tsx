import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import { ioCurrentRoom, ioMessages, ioNickName } from "../atom";

interface IRoomForm {
  roomName: string;
}
interface IChatForm {
  message: string;
  nickname: string;
}
const socket = io("http://localhost:3001", {
  withCredentials: true,
});
function SocketIOPage() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [connected, setIsConnected] = useState(false);
  const [messages, setMessages] = useRecoilState(ioMessages);
  const [currentRoom, setCurrentRoom] = useRecoilState(ioCurrentRoom);
  const [nicknameState, setNicknameState] = useRecoilState(ioNickName);
  const { register: roomRegister, handleSubmit: handleRoomSubmit } =
    useForm<IRoomForm>();
  const { register, handleSubmit, resetField, setValue } = useForm<IChatForm>();
  useEffect(() => {
    if (!socket.connected) {
      socket.on("connect", () => {
        setIsConnected(true);
      });
      socket.on("joinRoom", () => {
        addMessage("someone joined");
      });
      socket.on("leaveRoom", () => {
        addMessage("someone left");
      });
      socket.on("message", addMessage);
    } else {
      setIsConnected(true);
      setValue("nickname", nicknameState);
    }
  }, [socket]);
  const onRoomValid: SubmitHandler<IRoomForm> = ({ roomName }) => {
    socket.emit("enterRoom", { roomName }, () => setCurrentRoom(roomName)); // can send object & eventName!
  };
  const onChatValid: SubmitHandler<IChatForm> = ({ message, nickname }) => {
    if (nickname !== nicknameState) {
      setNicknameState(nickname);
    }
    socket.emit("message", { message, nickname, roomName: currentRoom }, () =>
      addMessage(`Me: ${message}`)
    );
    resetField("message");
  };
  function addMessage(message: string) {
    setMessages((current) => current.concat(message));
  }
  return (
    <>
      {connected ? (
        <div>
          <h2>
            {nicknameState
              ? `HI! ${nicknameState} | Room: ${currentRoom}`
              : "Connected to Server"}
          </h2>
          {currentRoom ? (
            <form onSubmit={handleSubmit(onChatValid)}>
              <section>
                <ul>
                  {messages.map((message, i) => (
                    <li key={i}>{message}</li>
                  ))}
                </ul>
              </section>
              <div style={{ display: "flex" }}>
                <input
                  {...register("nickname", { required: true })}
                  type="text"
                  placeholder="choose a nickname"
                  style={{ width: "20%", marginRight: "20px" }}
                />
                <input
                  {...register("message", {
                    required: true,
                  })}
                  type="text"
                  placeholder="write a message"
                />
              </div>
              <button>Send</button>
            </form>
          ) : (
            <form onSubmit={handleRoomSubmit(onRoomValid)}>
              <input
                {...roomRegister("roomName", { required: true })}
                type="text"
                placeholder="Enter the roomname"
              />
              <button>Enter</button>
            </form>
          )}
        </div>
      ) : null}
    </>
  );
}
export default SocketIOPage;
