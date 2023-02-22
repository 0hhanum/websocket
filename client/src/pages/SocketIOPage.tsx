import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import { ioMessages } from "../atom";
const socket = io("http://localhost:3001", {
  withCredentials: true,
});
function SocketIOPage() {
  const [connected, setIsConnected] = useState(false);
  const [messages, setMessages] = useRecoilState(ioMessages);
  useEffect(() => {
    if (!socket.connected) {
      socket.on("connect", () => {
        setIsConnected(true);
      });
    } else {
      setIsConnected(true);
    }
  }, [socket]);
  return (
    <>
      {connected ? (
        <div>
          <h2>Connected to Server</h2>
          <ul>
            {messages.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
export default SocketIOPage;
