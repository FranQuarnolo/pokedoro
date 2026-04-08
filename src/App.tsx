import { useState } from "react";
import "./index.css";
import { TimerListPage } from "./pages/TimerListPage";
import { ActiveTimerPage } from "./pages/ActiveTimerPage";
import type { PomoSession } from "./types";

function App() {
  const [activeSession, setActiveSession] = useState<PomoSession | null>(null);

  return (
    <>
      <div className="app-container">
        {!activeSession && <TimerListPage onSessionSelect={setActiveSession} />}
        {activeSession && (
          <ActiveTimerPage session={activeSession} onBack={() => setActiveSession(null)} />
        )}
      </div>
      <div className="orientation-lock">
        <p>Por favor, girá tu dispositivo a modo vertical.</p>
      </div>
    </>
  );
}

export default App;
