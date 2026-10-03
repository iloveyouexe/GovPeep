import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/landing.css";

// Discard demo authentication. Real sessions are server-managed HttpOnly cookies.
localStorage.removeItem("persist:root");
document.cookie = "user=; Max-Age=0; path=/";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
