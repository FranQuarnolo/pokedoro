import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "pomodoro_timer_state";

interface TimerState {
  sessionId: string;
  endAt: number; // absolute timestamp ms
  pausedAt: number | null; // ms remaining when paused
}

const clearStorage = () => localStorage.removeItem(STORAGE_KEY);
const saveStorage = (state: TimerState) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const loadStorage = (): TimerState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const usePomodoro = (
  initialSeconds: number,
  sessionId: string,
  onFinish?: () => void
) => {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Restore state from storage if same session
  const getInitialState = (): { timeLeft: number; isRunning: boolean } => {
    const saved = loadStorage();
    if (saved && saved.sessionId === sessionId) {
      if (saved.pausedAt !== null) {
        return { timeLeft: Math.max(0, Math.round(saved.pausedAt / 1000)), isRunning: false };
      }
      const remaining = Math.round((saved.endAt - Date.now()) / 1000);
      if (remaining > 0) {
        return { timeLeft: remaining, isRunning: true };
      }
    }
    return { timeLeft: initialSeconds, isRunning: false };
  };

  const initial = getInitialState();
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setTimeLeft((prev) => {
      const endAt = Date.now() + prev * 1000;
      saveStorage({ sessionId, endAt, pausedAt: null });
      return prev;
    });
    setIsRunning(true);
  }, [sessionId]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    setTimeLeft((prev) => {
      const saved = loadStorage();
      if (saved && saved.sessionId === sessionId) {
        saveStorage({ ...saved, pausedAt: prev * 1000 });
      }
      return prev;
    });
  }, [clearTimer, sessionId]);

  const reset = useCallback(
    (newSeconds: number) => {
      clearTimer();
      setIsRunning(false);
      setTimeLeft(newSeconds);
      clearStorage();
    },
    [clearTimer]
  );

  // Tick loop using timestamps for accuracy
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const saved = loadStorage();
      if (!saved || saved.sessionId !== sessionId) return;

      const remaining = Math.round((saved.endAt - Date.now()) / 1000);
      if (remaining <= 0) {
        clearTimer();
        setIsRunning(false);
        setTimeLeft(0);
        clearStorage();
        onFinishRef.current?.();
        return;
      }
      setTimeLeft(remaining);
    };

    tick(); // immediate first tick
    intervalRef.current = setInterval(tick, 500);
    return clearTimer;
  }, [isRunning, sessionId, clearTimer]);

  // Handle visibility change: recalculate on tab focus
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const saved = loadStorage();
      if (!saved || saved.sessionId !== sessionId) return;

      if (saved.pausedAt !== null) {
        setTimeLeft(Math.round(saved.pausedAt / 1000));
        setIsRunning(false);
        return;
      }

      const remaining = Math.round((saved.endAt - Date.now()) / 1000);
      if (remaining <= 0) {
        clearTimer();
        setIsRunning(false);
        setTimeLeft(0);
        clearStorage();
        onFinishRef.current?.();
      } else {
        setTimeLeft(remaining);
        setIsRunning(true);
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [sessionId, clearTimer]);

  return { timeLeft, isRunning, start, pause, reset };
};
