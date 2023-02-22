import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import { ioMessages } from "../atom";

interface IRoomForm {
  roomName: string;
}
const socket = io("http://localhost:3001", {
  withCredentials: true,
});
function SocketIOPage() {
  const [connected, setIsConnected] = useState(false);
  const [messages, setMessages] = useRecoilState(ioMessages);
  const { register, handleSubmit, resetField, setValue } = useForm<IRoomForm>();
  useEffect(() => {
    if (!socket.connected) {
      socket.on("connect", () => {
        setIsConnected(true);
      });
    } else {
      setIsConnected(true);
    }
  }, [socket]);
  const onValid: SubmitHandler<IRoomForm> = ({ roomName }) => {
    socket.emit("room", { roomName }); // can send object & eventName!
  };
  return (
    <>
      {connected ? (
        <div>
          <h2>Connected to Server</h2>
          <form onSubmit={handleSubmit(onValid)}>
            <input
              {...register("roomName", { required: true })}
              type="text"
              placeholder="Enter the roomname"
            />
            <button>Enter</button>
          </form>
        </div>
      ) : null}
    </>
  );
}
export default SocketIOPage;
