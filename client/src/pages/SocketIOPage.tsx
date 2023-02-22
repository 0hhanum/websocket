import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { io } from "socket.io-client";
const socket = io();
function SocketIOPage() {
  const [connected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });
  }, [socket]);
  return <>{connected ? null : null}</>;
}
export default SocketIOPage;
