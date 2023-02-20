import { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm, SubmitHandler } from "react-hook-form";

const Container = styled.div`
  padding: 20px 80px;
`;

interface IForm {
  message: string;
}

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connect, setConnect] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const { register, handleSubmit, reset } = useForm<IForm>();
  const onValid: SubmitHandler<IForm> = (data) => {
    socket?.send(data.message);
    reset();
  };
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    setSocket(socket);
    socket.addEventListener("open", () => {
      setConnect(true);
    });
    socket.addEventListener("message", (message: MessageEvent) => {
      setMessages((current) => current.concat(message.data));
    });
  }, []);
  return (
    <Container>
      <nav>
        <h1>WebSocket</h1>
      </nav>
      <main>
        {connect ? (
          <div>
            <h2>Connected to Server</h2>
            <ul>
              {messages.map((message) => (
                <li>{message}</li>
              ))}
            </ul>
            <form onSubmit={handleSubmit(onValid)}>
              <input
                {...register("message", { required: true })}
                type="text"
                placeholder="write a message"
              />
              <button>Send</button>
            </form>
          </div>
        ) : null}
      </main>
    </Container>
  );
}

export default App;