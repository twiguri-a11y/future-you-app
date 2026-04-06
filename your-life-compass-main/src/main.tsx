import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.jsx";
import "./index.css";
import "./App.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
