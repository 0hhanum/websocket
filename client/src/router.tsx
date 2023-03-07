import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import SocketIOPage from "./pages/SocketIOPage";
import WSPage from "./pages/WSPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <WSPage />,
      },
      {
        path: "/ws",
        element: <WSPage />,
      },
    ],
  },
]);
