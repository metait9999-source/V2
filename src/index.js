import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// Change BrowserRouter to HashRouter
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { SocketContextProvider } from "./context/SocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Use HashRouter instead of BrowserRouter */}
    <UserProvider>
      <BrowserRouter>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>,
);

reportWebVitals();
