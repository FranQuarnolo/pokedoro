import React, { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { PomoSession } from "../types";

// Forma del contexto
interface TimersContextType {
  sessions: PomoSession[];
  addSession: (session: PomoSession) => void;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<PomoSession>) => void;
  reorderSessions: (next: PomoSession[]) => void; // 👈 NUEVO
}

// Contexto
const TimersContext = createContext<TimersContextType | undefined>(undefined);

// Proveedor
export const TimersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useLocalStorage<PomoSession[]>(
    "pomoSessions",
    []
  );

  const addSession = (session: PomoSession) =>
    setSessions([...sessions, session]);
  const deleteSession = (id: string) =>
    setSessions(sessions.filter((s) => s.id !== id));
  const updateSession = (id: string, updates: Partial<PomoSession>) =>
    setSessions(sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)));

  // 👇 NUEVA función: permite reordenar
  const reorderSessions = (next: PomoSession[]) => {
    setSessions(next);
    // si querés persistir en localStorage manualmente:
    // localStorage.setItem("pomoSessions", JSON.stringify(next));
  };

  return (
    <TimersContext.Provider
      value={{
        sessions,
        addSession,
        deleteSession,
        updateSession,
        reorderSessions, // 👈 agregado
      }}
    >
      {children}
    </TimersContext.Provider>
  );
};

// Hook
export const useTimers = () => {
  const context = useContext(TimersContext);
  if (context === undefined) {
    throw new Error("useTimers debe ser usado dentro de un TimersProvider");
  }
  return context;
};
