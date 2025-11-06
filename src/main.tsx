import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConfigProvider, theme } from "antd"; // Importa 'theme'
import esES from "antd/locale/es_ES";
import { TimersProvider } from "./contexts/TimersContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={esES}
      theme={{
        // Configura el tema
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#6ca2ff",
          colorInfo: "#6ca2ff",
          borderRadius: 12,
          colorBgContainer: "#161b22",
          colorBorder: "#30363d",
          controlHeight: 44,
        },
      }}
    >
      <TimersProvider>
        <App />
      </TimersProvider>
    </ConfigProvider>
  </React.StrictMode>
);
