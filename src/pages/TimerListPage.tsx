import React, { useState } from "react";
import {
  Button,
  List,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTimers } from "../contexts/TimersContext";
import styles from "../styles/TimerListPage.module.css"; // Crearemos este CSS
import { PokemonSelector } from "../components/pokemon/PokemonSelector";
import type { PomoSession } from "../types";
import logo from "../assets/logo.png";

interface Props {
  // Esta prop es nuestro "router": nos dice qué sesión seleccionar
  onSessionSelect: (session: PomoSession) => void;
}

export const TimerListPage: React.FC<Props> = ({ onSessionSelect }) => {
  const { sessions, addSession, deleteSession } = useTimers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateSession = (values: any) => {
    const newSession: PomoSession = {
      id: Date.now().toString(), // ID simple basado en timestamp
      name: values.name,
      durationMinutes: values.durationMinutes,
      pokemonId: values.pokemonId.toLowerCase().trim() || "pikachu", // Default
      pokemonNickname: values.pokemonNickname || "",
    };
    addSession(newSession);
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evita que el click active el onSessionSelect
    deleteSession(id);
  };

  return (
    <div className={styles.container}>
      <img src={logo} alt="logo" className={styles.logo} />

      <p className={styles.subtitle}>Mis Timers:</p>

      <List
        itemLayout="horizontal"
        dataSource={sessions}
        locale={{ emptyText: "Aún no tienes timers. ¡Crea uno!" }}
        renderItem={(session) => (
          <List.Item
            className={styles.listItem}
            onClick={() => onSessionSelect(session)}
            actions={[
              <Popconfirm
                title="¿Borrar este timer?"
                onConfirm={(e) => handleDelete(e!, session.id)}
                onCancel={(e) => e?.stopPropagation()}
                okText="Sí"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={session.name}
              description={`${session.durationMinutes} min | ${
                session.pokemonNickname || session.pokemonId
              }`}
            />
          </List.Item>
        )}
      />

      {/* Botón Flotante (FAB) para crear nuevo */}
      <Button
        className={styles.fab}
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size="large"
        onClick={() => setIsModalOpen(true)}
      />

      {/* Modal de Creación */}
      <Modal
        title="Crear Nuevo Pomo-mon"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSession}>
          <Form.Item
            name="name"
            label="Nombre de la Sesión"
            rules={[{ required: true, message: "Dale un nombre" }]}
          >
            <Input placeholder="Ej: Estudio React" />
          </Form.Item>
          <Form.Item
            name="durationMinutes"
            label="Duración (minutos)"
            initialValue={25}
            rules={[{ required: true, message: "Define un tiempo" }]}
          >
            <InputNumber min={1} max={120} />
          </Form.Item>
          <Form.Item
            name="pokemonId"
            label="Pokémon (ID)"
            initialValue={"pikachu"}
            rules={[{ required: true, message: "Elige un Pokémon" }]}
          >
            <PokemonSelector placeholder="Ej: pikachu" />
          </Form.Item>
          <Form.Item
            name="pokemonNickname"
            label="Apodo del Pokémon (Opcional)"
          >
            <Input placeholder="Ej: Juan" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
