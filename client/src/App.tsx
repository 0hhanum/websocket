import { Outlet, Link, useMatch } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px 80px;
`;
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    margin: 0;
  }
  margin-bottom: 60px;
`;
const NavUl = styled.ul`
  li {
    margin-left: 20px;
  }
  li.active {
    a {
      color: yellow;
    }
  }
`;
function App() {
  return (
    <Container>
      <header>
        <Nav>
          <h1>RealTime Web</h1>
          <NavUl>
            <li className={useMatch("/") ? "active" : "normal"}>
              <Link to="/">WebSocket</Link>
            </li>
            <li className={useMatch("/socket-io") ? "active" : "normal"}>
              <Link to="/socket-io">Socket.io</Link>
            </li>
          </NavUl>
        </Nav>
      </header>
      <main>
        <Outlet />
      </main>
    </Container>
  );
}

export default App;
