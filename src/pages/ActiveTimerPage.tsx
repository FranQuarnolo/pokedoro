import React, { useState, useEffect, useRef } from "react";
import { Button, notification } from "antd";
import {
  SettingOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { PokemonSprite } from "../components/pokemon/PokemonSprite";
import { usePomodoro } from "../hooks/usePomodoro";
import { useTimers } from "../contexts/TimersContext";
import styles from "../styles/ActiveTimerPage.module.css";
import type { PomoSession } from "../types";
import { SessionModal } from "./SessionModal";

interface Props {
  session: PomoSession;
  onBack: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export const ActiveTimerPage: React.FC<Props> = ({ session, onBack }) => {
  const { updateSession } = useTimers();

  // Sesión local para re-render inmediato al editar
  const [current, setCurrent] = useState<PomoSession>(session);
  useEffect(() => {
    // si cambiaste de sesión desde la lista, sincroniza
    setCurrent(session);
  }, [session.id]);

  const initialSeconds = Math.round(current.durationMinutes * 60);

  // sonidos
  const tapRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    tapRef.current = new Audio("/sounds/tap.mp3");
    startRef.current = new Audio("/sounds/start.mp3");
    endRef.current = new Audio("/sounds/end.mp3");
    [tapRef.current, startRef.current, endRef.current].forEach((a) => {
      if (a) a.volume = 0.7;
    });
  }, []);

  const play = (ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    try {
      if (ref.current) {
        ref.current.currentTime = 0;
        ref.current.play();
      }
    } catch {}
  };

  const [hasStarted, setHasStarted] = useState(false);

  const handleFinish = () => {
    play(endRef);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    notification.open({
      message: "Pomodoro finalizado",
      description: "Tu sesión terminó 🎯",
      placement: "top",
    });
    setHasStarted(false); // vuelve a "Iniciar"
  };

  const { timeLeft, isRunning, start, pause, reset } = usePomodoro(
    initialSeconds,
    handleFinish
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartPause = () => {
    play(tapRef);
    if (isRunning) {
      pause();
    } else {
      play(startRef);
      start();
      setHasStarted(true);
    }
  };

  const handleReset = () => {
    play(tapRef);
    reset(initialSeconds);
    setHasStarted(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button type="text" size="small" onClick={onBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className={styles.headerTitle}>{current.name}</h3>
        <Button
          type="text"
          icon={<SettingOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        />
      </header>

      <main className={styles.mainContent}>
        <div className={styles.timerDisplay}>{formatTime(timeLeft)}</div>
        <div className={styles.pokemonContainer}>
          <PokemonSprite
            pokemonId={current.pokemonId}
            isTimerRunning={isRunning}
          />
          <p className={styles.pokemonName}>
            {current.pokemonNickname || current.pokemonId}
          </p>
        </div>

        <div className={styles.actionsRow}>
          <Button
            type="primary"
            size="middle"
            className={styles.cta}
            onClick={handleStartPause}
          >
            {isRunning ? "Pausar" : hasStarted ? "Reanudar" : "Iniciar"}
          </Button>

          {hasStarted && (
            <Button
              aria-label="Resetear"
              className={styles.resetCircle}
              shape="circle"
              onClick={handleReset}
              icon={<ReloadOutlined />}
            />
          )}
        </div>
      </main>

      <SessionModal
        open={isModalOpen}
        mode="edit"
        initialValues={current}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(values) => {
          // `values.durationSeconds` viene del modal. Fallback por si aún no lo agregaste.
          const durationSeconds =
            typeof values.durationSeconds === "number"
              ? values.durationSeconds
              : Math.round(Number(values.durationMinutes) * 60);

          const updated: PomoSession = {
            ...current,
            name: values.name,
            pokemonId: values.pokemonId.toLowerCase().trim(),
            pokemonNickname: values.pokemonNickname,
            durationMinutes: Number(values.durationMinutes),
          };

          // persistir en contexto
          updateSession(current.id, updated);

          // refrescar UI y timer al instante
          setCurrent(updated);
          reset(durationSeconds);
          setHasStarted(false);

          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
