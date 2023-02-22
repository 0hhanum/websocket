import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import WebSocket from "./pages/WebSocket";

const Container = styled.div`
  padding: 20px 80px;
`;

function App() {
  return (
    <Container>
      <nav>
        <h1>WebSocket</h1>
      </nav>
      <main>
        <Outlet />
      </main>
    </Container>
  );
}

export default App;
