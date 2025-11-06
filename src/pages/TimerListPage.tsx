import React, { useMemo } from "react";
import { Button, List, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useTimers } from "../contexts/TimersContext";
import styles from "../styles/TimerListPage.module.css";
import type { PomoSession } from "../types";
import logo from "../assets/logo.png";
import { SessionModal } from "./SessionModal";

interface Props {
  onSessionSelect: (session: PomoSession) => void;
}

function formatDuration(minsDecimal: number) {
  const total = Math.round(minsDecimal * 60); // segundos exactos
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0 && s === 0) return `${m} min`;
  if (m > 0 && s > 0) return `${m} min ${s} s`;
  return `${s} s`;
}

// Item sortable
const SortableItem: React.FC<{
  session: PomoSession;
  onClick: () => void;
  onConfirmDelete: (e: React.MouseEvent) => void;
}> = ({ session, onClick, onConfirmDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    ...(isDragging ? { opacity: 0.85 } : null),
  } as React.CSSProperties;

  return (
    <List.Item
      ref={setNodeRef}
      style={style}
      className={styles.listItem}
      onClick={onClick}
      // Área drag: todo el item. Si querés un “handle”, pasa {...listeners} a un icono.
      {...attributes}
      {...listeners}
      actions={[
        <Popconfirm
          title="¿Borrar este timer?"
          onConfirm={() => onConfirmDelete}
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
        description={`${formatDuration(session.durationMinutes)} | ${
          session.pokemonNickname || session.pokemonId
        }`}
      />
    </List.Item>
  );
};

export const TimerListPage: React.FC<Props> = ({ onSessionSelect }) => {
  const { sessions, addSession, deleteSession, reorderSessions } = useTimers();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const ids = useMemo(() => sessions.map((s) => s.id), [sessions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sessions.findIndex((s) => s.id === active.id);
    const newIndex = sessions.findIndex((s) => s.id === over.id);
    const next = arrayMove(sessions, oldIndex, newIndex);
    reorderSessions(next);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
  };

  return (
    <div className={styles.container}>
      <img src={logo} alt="logo" className={styles.logo} />

      {/* Alternativas de título: */}
      {/* <p className={styles.subtitle}>Tus Pokedoros</p> */}
      {/* <p className={styles.subtitle}>Sesiones</p> */}
      {/* <p className={styles.subtitle}>Tu equipo de foco</p> */}
      <p className={styles.subtitle}>Tus Pokedoros</p>

      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <List
            itemLayout="horizontal"
            dataSource={sessions}
            locale={{ emptyText: "Aún no tienes timers. ¡Crea uno!" }}
            renderItem={(session) => (
              <SortableItem
                key={session.id}
                session={session}
                onClick={() => onSessionSelect(session)}
                onConfirmDelete={(e) => handleDelete(e as any, session.id)}
              />
            )}
          />
        </SortableContext>
      </DndContext>

      <Button
        className={styles.fab}
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size="large"
        onClick={() => setIsModalOpen(true)}
      />

      <SessionModal
        open={isModalOpen}
        mode="create"
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(values) => {
          const newSession: PomoSession = {
            id: Date.now().toString(),
            name: values.name,
            durationMinutes: values.durationMinutes, // puede ser decimal (ej. 0.1666…)
            pokemonId: values.pokemonId.toLowerCase().trim() || "pikachu",
            pokemonNickname: values.pokemonNickname || "",
          };
          addSession(newSession);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
