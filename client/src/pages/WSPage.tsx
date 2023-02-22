import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface IForm {
  message: string;
  nickname: string;
}
const socket: WebSocket = new WebSocket("ws://localhost:3000");
export function WSPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const { register, handleSubmit, resetField } = useForm<IForm>();
  const onValid: SubmitHandler<IForm> = ({ message, nickname }) => {
    socket?.send(
      JSON.stringify({
        message: message,
        nickname: nickname,
      })
    );
    setMessages((current) => current.concat(`Me: ${message}`));
    resetField("message");
  };
  useEffect(() => {
    if (socket.readyState !== 1) {
      socket.addEventListener("open", () => {
        setIsConnected(true);
      });
      socket.addEventListener("message", (message: MessageEvent) => {
        setMessages((current) => current.concat(`someone: ${message.data}`));
      });
    } else {
      setIsConnected(true);
    }
  }, [socket]);
  return (
    <>
      {isConnected ? (
        <div>
          <h2>Connected to Server</h2>
          <ul>
            {messages.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
          <form onSubmit={handleSubmit(onValid)}>
            <div style={{ display: "flex" }}>
              <input
                {...register("nickname", { required: true })}
                type="text"
                placeholder="choose a nickname"
                style={{ width: "20%", marginRight: "20px" }}
              />
              <input
                {...register("message", { required: true })}
                type="text"
                placeholder="write a message"
              />
            </div>
            <button>Send</button>
          </form>
        </div>
      ) : null}
    </>
  );
}
export default WSPage;
