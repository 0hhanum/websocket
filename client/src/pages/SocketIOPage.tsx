import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001", {
  withCredentials: true,
});
function SocketIOPage() {
  const [connected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.on("connect", () => {
        setIsConnected(true);
      });
    } else {
      setIsConnected(true);
    }
  }, [socket]);
  return <>{connected ? null : null}</>;
}
export default SocketIOPage;
