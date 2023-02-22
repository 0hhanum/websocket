import { createBrowserRouter } from "react-router-dom";
import App from "./App";
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
    ],
  },
]);
