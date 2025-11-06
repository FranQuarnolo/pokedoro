import React, { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { PomoSession } from "../types";

// Definimos la forma del contexto
interface TimersContextType {
  sessions: PomoSession[];
  addSession: (session: PomoSession) => void;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<PomoSession>) => void;
}

// Creamos el contexto
const TimersContext = createContext<TimersContextType | undefined>(undefined);

// Creamos el Proveedor
export const TimersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useLocalStorage<PomoSession[]>(
    "pomoSessions",
    []
  );

  const addSession = (session: PomoSession) => {
    setSessions([...sessions, session]);
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const updateSession = (id: string, updates: Partial<PomoSession>) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <TimersContext.Provider
      value={{ sessions, addSession, deleteSession, updateSession }}
    >
      {children}
    </TimersContext.Provider>
  );
};

// Hook para consumir el contexto fácilmente
export const useTimers = () => {
  const context = useContext(TimersContext);
  if (context === undefined) {
    throw new Error("useTimers debe ser usado dentro de un TimersProvider");
  }
  return context;
};
