import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SessionProvider } from "./lib/SessionContext";
import "./index.css";

// Vite injects BASE_URL from vite.config.ts `base` ("/app/" in build,
// "/" in dev). React Router wants the basename without a trailing
// slash; strip it so /app/ -> "/app" and / -> "".
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
