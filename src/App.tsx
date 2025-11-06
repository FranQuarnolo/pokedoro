import { useState } from "react";
import "./styles/global.css";
import { TimerListPage } from "./pages/TimerListPage";
import { ActiveTimerPage } from "./pages/ActiveTimerPage";
import type { PomoSession } from "./types";

function App() {
  // Este estado controla qué página se muestra
  const [activeSession, setActiveSession] = useState<PomoSession | null>(null);

  return (
    <>
      <div className="app-container">
        {!activeSession && (
          // Si no hay sesión activa, muestra la lista
          <TimerListPage onSessionSelect={setActiveSession} />
        )}

        {activeSession && (
          // Si seleccionamos una, muestra el timer
          <ActiveTimerPage
            session={activeSession}
            onBack={() => setActiveSession(null)}
          />
        )}
      </div>

      <div className="orientation-lock">
        <p>Por favor, gira tu dispositivo a modo vertical.</p>
      </div>
    </>
  );
}

export default App;
