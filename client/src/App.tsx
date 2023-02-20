import { useEffect } from "react";

function App() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
  }, []);
  return (
    <>
      <nav>
        <h1>WebSocket</h1>
      </nav>
      <main>Hello world</main>
    </>
  );
}

export default App;
