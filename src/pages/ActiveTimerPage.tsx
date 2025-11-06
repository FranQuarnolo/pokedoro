import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Input, Form, InputNumber, notification } from "antd";
import { SettingOutlined, ReloadOutlined } from "@ant-design/icons";
import { PokemonSelector } from "../components/pokemon/PokemonSelector";
import { PokemonSprite } from "../components/pokemon/PokemonSprite";
import { usePomodoro } from "../hooks/usePomodoro";
import { useTimers } from "../contexts/TimersContext";
import styles from "../styles/ActiveTimerPage.module.css";
import type { PomoSession } from "../types";

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
  const initialSeconds = session.durationMinutes * 60;

  // 🔔 audio ref para sonido final
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio("/sounds/ding.mp3");
    if (audioRef.current) audioRef.current.volume = 0.7;
  }, []);

  const handleFinish = () => {
    // reproducir sonido
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } catch {}
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    notification.open({
      message: "Pomodoro finalizado",
      description: "Tu sesión terminó 🎯",
      placement: "top",
    });
  };

  const { timeLeft, isRunning, start, pause, reset } = usePomodoro(
    initialSeconds,
    handleFinish
  );

  const [hasStarted, setHasStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isRunning) {
      reset(initialSeconds);
      setHasStarted(false);
    }
    form.setFieldsValue({
      name: session.name,
      pokemonId: session.pokemonId,
      pokemonNickname: session.pokemonNickname,
      durationMinutes: session.durationMinutes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSaveSettings = (values: any) => {
    const updated = {
      ...session,
      name: values.name,
      pokemonId: values.pokemonId.toLowerCase().trim(),
      pokemonNickname: values.pokemonNickname,
      durationMinutes: Number(values.durationMinutes),
    };
    updateSession(session.id, updated);
    Object.assign(session, updated); // refresca sin salir
    setIsModalOpen(false);
  };

  const handleStartPause = () => {
    if (isRunning) pause();
    else {
      start();
      setHasStarted(true);
    }
  };

  const handleReset = () => {
    reset(initialSeconds);
    setHasStarted(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button type="text" size="small" onClick={onBack}>
          ‹ Mis Timers
        </Button>
        <h3 className={styles.headerTitle}>{session.name}</h3>
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
            pokemonId={session.pokemonId}
            isTimerRunning={isRunning}
          />
          <p className={styles.pokemonName}>
            {session.pokemonNickname || session.pokemonId}
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

      <Modal
        title="Configurar sesión"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Guardar"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Ej: Estudio" />
          </Form.Item>

          <Form.Item
            name="pokemonId"
            label="Pokémon"
            rules={[{ required: true, message: "Elegí un Pokémon" }]}
          >
            <PokemonSelector placeholder="Ej: pikachu, gengar, snorlax" />
          </Form.Item>

          <Form.Item name="pokemonNickname" label="Apodo del Pokémon">
            <Input placeholder="Opcional" />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="Duración (min)"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
