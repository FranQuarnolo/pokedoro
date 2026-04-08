import { useState, useEffect } from "react";

interface StoredTimer {
  sessionId: string;
  endAt: number;
  pausedAt: number | null;
}

const readStorage = (): StoredTimer | null => {
  try {
    const raw = localStorage.getItem("pomodoro_timer_state");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Polls localStorage every 500ms to get the active timer state. */
export const useTimerStatus = () => {
  const [stored, setStored] = useState<StoredTimer | null>(readStorage);

  useEffect(() => {
    const tick = () => setStored(readStorage());
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const isActivelyRunning =
    stored !== null &&
    stored.pausedAt === null &&
    stored.endAt > Date.now();

  const activeSessionId = isActivelyRunning ? stored!.sessionId : null;

  const getTimeLeft = (sessionId: string): number | null => {
    if (!stored || stored.sessionId !== sessionId || stored.pausedAt !== null) return null;
    const remaining = Math.round((stored.endAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : null;
  };

  return { activeSessionId, getTimeLeft };
};
