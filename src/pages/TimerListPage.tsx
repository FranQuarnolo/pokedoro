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
import { useTimerStatus } from "../hooks/useTimerStatus";
import { usePokeType, hexToRgb } from "../hooks/usePokeType";
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
  if (m > 0 && s === 0) return `${m}:00`;
  if (m > 0 && s > 0) return `${m}:${String(s).padStart(2, "0")}`;
  return `0:${String(s).padStart(2, "0")}`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const SortableItem: React.FC<{
  session: PomoSession;
  isActive: boolean;
  timeLeft: number | null;
  onClick: () => void;
  onDelete: () => void;
}> = ({ session, isActive, timeLeft, onClick, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: session.id });

  // Type color from PokeAPI (cached, updates asynchronously)
  const typeColor = usePokeType(session.pokemonId);

  // dnd-kit transform/transition must be inline (dynamic pixel values).
  // CSS variables are set here so static CSS classes can reference them.
  const dragStyle = {
    "--type-color": typeColor,
    "--type-rgb": hexToRgb(typeColor),
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className={`relative flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.99]
        ${isDragging ? "opacity-60 z-10 scale-[1.02]" : ""}
        ${!isActive ? "hover:-translate-y-0.5" : ""}
        ${isActive ? "card-active" : "card-idle"}
      `}
      onClick={onClick}
    >
      {/* Type-colored left indicator bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full transition-all duration-300 ${isActive ? "type-bar" : "type-bar-dim"}`} />

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        {/* Duration (type color) + Session name (white) — visually distinct */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tabular-nums shrink-0 transition-colors duration-300 type-text">
            {formatDuration(session.durationMinutes)}
          </span>
          <span className="text-base font-semibold text-slate-100 truncate">
            {session.name}
          </span>
        </div>
        {/* Pokemon nickname */}
        <p className="text-sm text-slate-500 capitalize mt-0.5 truncate">
          {session.pokemonNickname
            ? `${session.pokemonNickname} · ${session.pokemonId}`
            : session.pokemonId}
        </p>
      </div>

      {/* Right side: live countdown + delete */}
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {timeLeft !== null && (
          <span className="text-xl font-bold tabular-nums min-w-14.5 text-right transition-colors duration-300 type-text">
            {formatTime(timeLeft)}
          </span>
        )}

        <Popconfirm
          title="¿Borrar este timer?"
          description="Esta acción no se puede deshacer."
          onConfirm={onDelete}
        >
          <button
            type="button"
            aria-label="Eliminar sesión"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </Popconfirm>
      </div>
    </div>
  );
};

export const TimerListPage: React.FC<Props> = ({ onSessionSelect }) => {
  const { sessions, addSession, deleteSession, reorderSessions } = useTimers();
  const { activeSessionId, getTimeLeft } = useTimerStatus();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Sort: active session first, rest maintain order
  const sortedSessions = useMemo(() => {
    if (!activeSessionId) return sessions;
    return [...sessions].sort((a, b) => {
      if (a.id === activeSessionId) return -1;
      if (b.id === activeSessionId) return 1;
      return 0;
    });
  }, [sessions, activeSessionId]);

  const ids = useMemo(() => sortedSessions.map((s) => s.id), [sortedSessions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedSessions.findIndex((s) => s.id === active.id);
    const newIndex = sortedSessions.findIndex((s) => s.id === over.id);
    reorderSessions(arrayMove(sortedSessions, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full max-w-120 mx-auto px-4 pb-28">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-8">
        <img src={logo} alt="Pokedoro logo" className="w-40 object-contain mb-2" />
        <div className="flex items-center gap-2.5 mt-1">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-500">
            Tus Pokedoros
          </p>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border border-[#30363d] text-slate-600 bg-[#161b22] tracking-wider select-none">
            v{__APP_VERSION__}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="w-full flex flex-col gap-3">
        <DndContext
          onDragEnd={handleDragEnd}
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {sortedSessions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <span className="text-5xl">⏱️</span>
                <p className="text-slate-300 font-semibold text-lg">Aún no tenés timers</p>
                <p className="text-slate-600 text-base">Tocá el botón + para crear uno</p>
              </div>
            ) : (
              sortedSessions.map((session) => (
                <SortableItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  timeLeft={getTimeLeft(session.id)}
                  onClick={() => onSessionSelect(session)}
                  onDelete={() => deleteSession(session.id)}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* FAB */}
      <Button
        variant="primary"
        className="fixed bottom-8 right-5 w-16 h-16 rounded-2xl! p-0! text-3xl leading-none shadow-xl"
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
