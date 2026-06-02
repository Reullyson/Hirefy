import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";

console.log("Hirefy: Using Google Client ID:", GOOGLE_CLIENT_ID);

createRoot(document.getElementById("root")!).render(
  <App />
);
