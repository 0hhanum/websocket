import { useEffect, useState } from "react";

function App() {
  const [connect, setConnect] = useState(false);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.addEventListener("open", () => {
      setConnect(true);
    });
    socket.addEventListener("message", (message: MessageEvent) => {
      console.log(message.data);
    });
  }, []);
  return (
    <>
      <nav>
        <h1>WebSocket</h1>
      </nav>
      <main>{connect ? <h2>Connected to Server</h2> : null}</main>
    </>
  );
}

export default App;
