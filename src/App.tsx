import { useState, useEffect, useCallback } from "react";
import "./index.css";
import { TimerListPage } from "./pages/TimerListPage";
import { ActiveTimerPage } from "./pages/ActiveTimerPage";
import type { PomoSession } from "./types";

function App() {
  const [activeSession, setActiveSession] = useState<PomoSession | null>(null);

  // Push a history entry when opening the timer so Android back button
  // returns to the list instead of closing the app.
  useEffect(() => {
    if (activeSession) {
      window.history.pushState({ pokedoro: "timer" }, "");
    }
  }, [activeSession]);

  const goBack = useCallback(() => setActiveSession(null), []);

  useEffect(() => {
    const onPop = () => {
      if (activeSession) setActiveSession(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [activeSession]);

  return (
    <>
      <div className="app-container">
        {!activeSession && <TimerListPage onSessionSelect={setActiveSession} />}
        {activeSession && <ActiveTimerPage session={activeSession} onBack={goBack} />}
      </div>
      <div className="orientation-lock">
        <p>Por favor, girá tu dispositivo a modo vertical.</p>
      </div>
    </>
  );
}

export default App;
