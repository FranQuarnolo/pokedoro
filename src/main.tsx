import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TimersProvider } from "./contexts/TimersContext.tsx";
import { ToastProvider } from "./components/ui/Toast.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TimersProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </TimersProvider>
  </React.StrictMode>
);
