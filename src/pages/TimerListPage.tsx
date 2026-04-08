import React, { useMemo } from "react";
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
import type { PomoSession } from "../types";
import logo from "../assets/logo.png";
import { SessionModal } from "./SessionModal";
import { Button } from "../components/ui/Button";
import { Popconfirm } from "../components/ui/Popconfirm";

interface Props {
  onSessionSelect: (session: PomoSession) => void;
}

function formatDuration(minsDecimal: number) {
  const total = Math.round(minsDecimal * 60);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0 && s === 0) return `${m} min`;
  if (m > 0 && s > 0) return `${m} min ${s} s`;
  return `${s} s`;
}

const SortableItem: React.FC<{
  session: PomoSession;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ session, onClick, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: session.id });

  // transform and transition must be inline — dnd-kit generates dynamic pixel values
  const dragStyle = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`flex items-center gap-3 px-4 py-4 rounded-2xl border border-[#1e2736] bg-[#161b22] shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:-translate-y-0.5 hover:border-[#30363d] hover:shadow-md ${isDragging ? "opacity-70 z-10" : "opacity-100"}`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Arrastrar para reordenar"
        className="flex-shrink-0 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none p-1"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" /><circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{session.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className="text-[#6ca2ff]">{formatDuration(session.durationMinutes)}</span>
          {" · "}
          <span className="capitalize">{session.pokemonNickname || session.pokemonId}</span>
        </p>
      </div>

      {/* Delete */}
      <Popconfirm
        title="¿Borrar este timer?"
        description="Esta acción no se puede deshacer."
        onConfirm={() => onDelete({} as React.MouseEvent)}
      >
        <button
          type="button"
          aria-label="Eliminar sesión"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </Popconfirm>
    </div>
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
    reorderSessions(arrayMove(sessions, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full max-w-[480px] mx-auto px-4 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <img src={logo} alt="Pokedoro logo" className="w-36 object-contain mb-1" />
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500">
          Tus Pokedoros
        </p>
      </div>

      {/* List */}
      <div className="w-full flex flex-col gap-2">
        <DndContext
          onDragEnd={handleDragEnd}
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-4xl">⏱️</span>
                <p className="text-slate-400 font-medium">Aún no tenés timers</p>
                <p className="text-slate-600 text-sm">Tocá el botón + para crear uno</p>
              </div>
            ) : (
              sessions.map((session) => (
                <SortableItem
                  key={session.id}
                  session={session}
                  onClick={() => onSessionSelect(session)}
                  onDelete={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* FAB */}
      <Button
        variant="primary"
        className="fixed bottom-8 right-6 w-14 h-14 !rounded-2xl !p-0 shadow-xl text-2xl leading-none"
        onClick={() => setIsModalOpen(true)}
        aria-label="Crear nueva sesión"
      >
        +
      </Button>

      <SessionModal
        open={isModalOpen}
        mode="create"
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(values) => {
          addSession({
            id: Date.now().toString(),
            name: values.name,
            durationMinutes: values.durationMinutes,
            pokemonId: values.pokemonId.toLowerCase().trim() || "pikachu",
            pokemonNickname: values.pokemonNickname || "",
          });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
