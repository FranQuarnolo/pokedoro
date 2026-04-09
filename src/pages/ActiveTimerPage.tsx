import React, { useState, useEffect, useCallback } from "react";
import { PokemonSprite } from "../components/pokemon/PokemonSprite";
import { usePomodoro } from "../hooks/usePomodoro";
import { useTimers } from "../contexts/TimersContext";
import { useNotifications } from "../hooks/useNotifications";
import { useMediaSession } from "../hooks/useMediaSession";
import { useSilentAudio } from "../hooks/useSilentAudio";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import type { PomoSession } from "../types";
import { SessionModal } from "./SessionModal";

interface Props {
  session: PomoSession;
  onBack: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

/** Plays a 3-note ascending chime using Web Audio API — no external files needed. */
function playFinishChime() {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* ignore */ }
}

// Official artwork is available by Pokemon ID only; use Showdown animated GIF by name as artwork
function showdownGif(name: string) {
  const n = name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "").replace(/♀/g, "-f").replace(/♂/g, "-m");
  return `https://play.pokemonshowdown.com/sprites/ani/${n}.gif`;
}

export const ActiveTimerPage: React.FC<Props> = ({ session, onBack }) => {
  const { updateSession } = useTimers();
  const { show: showToast } = useToast();
  const { requestPermission, scheduleNotification, cancelScheduled } = useNotifications();
  const { start: startSilentAudio, stop: stopSilentAudio } = useSilentAudio();

  const [current, setCurrent] = useState<PomoSession>(session);
  useEffect(() => { setCurrent(session); }, [session.id]);

  const initialSeconds = Math.round(current.durationMinutes * 60);

  useEffect(() => {
    return () => { stopSilentAudio(); };
  }, [stopSilentAudio]);

  const [hasStarted, setHasStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFinish = useCallback(() => {
    playFinishChime();
    stopSilentAudio();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    showToast({
      message: "¡Pokedoro completado!",
      description: `${current.pokemonNickname || current.pokemonId} está orgulloso de vos 🎯`,
      type: "success",
    });
    setHasStarted(false);
  }, [current.pokemonId, current.pokemonNickname, showToast, stopSilentAudio]);

  const { timeLeft, isRunning, start, pause, reset } = usePomodoro(
    initialSeconds,
    current.id,
    handleFinish
  );

  // Request notification permission on mount
  useEffect(() => { requestPermission(); }, [requestPermission]);

  // Schedule background notification and manage silent audio when timer starts/stops
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      startSilentAudio();
      scheduleNotification(
        timeLeft * 1000,
        "¡Pokedoro completado! 🎯",
        `Sesión "${current.name}" terminó. ¡Buen trabajo!`,
      );
    } else {
      stopSilentAudio();
      cancelScheduled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Update Media Session metadata with current timer value so the notification
  // bar shows the countdown as the "album" field (updates every second)
  const mediaSessionTitle = isRunning
    ? `${formatTime(timeLeft)} ⏱`
    : current.name;

  useMediaSession({
    title: mediaSessionTitle,
    artist: current.pokemonNickname || current.pokemonId,
    artwork: showdownGif(current.pokemonId),
    isPlaying: isRunning,
    onPlay: useCallback(() => { start(); setHasStarted(true); }, [start]),
    onPause: useCallback(() => { pause(); }, [pause]),
  });

  // Update document title with timer
  useEffect(() => {
    document.title = isRunning ? `${formatTime(timeLeft)} — ${current.name}` : "POKEDORO";
    return () => { document.title = "POKEDORO"; };
  }, [timeLeft, isRunning, current.name]);

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else {
      start();
      setHasStarted(true);
    }
  };

  const handleReset = () => {
    reset(initialSeconds);
    setHasStarted(false);
  };

  const progress = initialSeconds > 0 ? timeLeft / initialSeconds : 1;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-120 mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          aria-label="Volver"
          className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          onClick={onBack}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <h3 className="text-base font-semibold text-slate-200 truncate mx-3 flex-1 text-center">
          {current.name}
        </h3>

        <button
          type="button"
          aria-label="Configurar sesión"
          className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 gap-8">
        {/* Timer ring */}
        <div className="relative flex items-center justify-center">
          <svg width="270" height="270" viewBox="0 0 260 260" className="-rotate-90">
            <circle cx="130" cy="130" r="110" fill="none" stroke="#1e2736" strokeWidth="6" />
            <circle
              cx="130" cy="130" r="110"
              fill="none"
              stroke={isRunning ? "#6ca2ff" : "#3a4a6b"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="progress-ring-circle"
            />
          </svg>

          <div className="absolute flex flex-col items-center gap-1">
            <div className={isRunning ? "animate-bounce-slow" : "animate-idle-float"}>
              <PokemonSprite pokemonId={current.pokemonId} isTimerRunning={isRunning} />
            </div>
            <p className="text-sm text-slate-500 capitalize font-medium mt-1">
              {current.pokemonNickname || current.pokemonId}
            </p>
          </div>
        </div>

        {/* Timer display */}
        <div className={`text-[88px] font-bold tabular-nums leading-none tracking-tight ${isRunning ? "timer-glow" : "timer-idle"}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 text-lg font-bold"
            onClick={handleStartPause}
          >
            {isRunning ? "Pausar" : hasStarted ? "Reanudar" : "Iniciar"}
          </Button>

          {hasStarted && (
            <button
              type="button"
              aria-label="Resetear"
              className="w-14 h-14 flex items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] text-slate-400 hover:text-slate-200 hover:border-[#4a5568] transition-colors active:scale-95"
              onClick={handleReset}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
              </svg>
            </button>
          )}
        </div>
      </main>

      <SessionModal
        open={isModalOpen}
        mode="edit"
        initialValues={current}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(values) => {
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

          updateSession(current.id, updated);
          setCurrent(updated);
          reset(durationSeconds);
          setHasStarted(false);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
