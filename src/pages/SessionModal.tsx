import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { DrumRollPicker } from "../components/ui/DrumRollPicker";
import { PokemonGridModal } from "../components/pokemon/PokemonGridModal";
import type { PomoSession } from "../types";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<PomoSession>;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    pokemonId: string;
    pokemonNickname: string;
    durationMinutes: number;
    durationSeconds: number;
  }) => void;
}

function LabeledField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const minutesOptions = Array.from({ length: 181 }, (_, i) => i);
const secondsOptions = Array.from({ length: 60 }, (_, i) => i);

function showdownGif(name: string) {
  const n = name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "").replace(/♀/g, "-f").replace(/♂/g, "-m");
  return `https://play.pokemonshowdown.com/sprites/ani/${n}.gif`;
}
const DITTO_SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png";

export const SessionModal: React.FC<Props> = ({ open, mode, initialValues, onCancel, onSubmit }) => {
  const initMinSec = useMemo(() => {
    const dm = Number(initialValues?.durationMinutes ?? 25);
    const total = Math.max(0, Math.round(dm * 60));
    return { m: Math.floor(total / 60), s: total % 60 };
  }, [initialValues?.durationMinutes]);

  const [name, setName] = useState("");
  const [pokemonId, setPokemonId] = useState("pikachu");
  const [pokemonNickname, setPokemonNickname] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [errors, setErrors] = useState<{ name?: string; pokemon?: string }>({});
  const [pokemonModalOpen, setPokemonModalOpen] = useState(false);
  const [gifError, setGifError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setPokemonId(initialValues?.pokemonId ?? "pikachu");
    setPokemonNickname(initialValues?.pokemonNickname ?? "");
    setMinutes(initMinSec.m);
    setSeconds(initMinSec.s);
    setErrors({});
    setGifError(false);
  }, [open, initialValues, initMinSec]);

  // Reset gif error when pokemon changes
  useEffect(() => { setGifError(false); }, [pokemonId]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Campo obligatorio";
    if (!pokemonId.trim()) errs.pokemon = "Elegí un Pokémon";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const totalSeconds = minutes * 60 + seconds;
    onSubmit({
      name: name.trim(),
      pokemonId: pokemonId.toLowerCase().trim(),
      pokemonNickname: pokemonNickname.trim(),
      durationMinutes: totalSeconds / 60,
      durationSeconds: totalSeconds,
    });
  };

  const title = mode === "create" ? "Nuevo Pokedoro" : "Editar Pokedoro";
  const okText = mode === "create" ? "Crear" : "Guardar";

  return (
    <>
      <Modal
        open={open}
        onClose={onCancel}
        title={title}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={onCancel}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={handleSubmit}>{okText}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-5 pb-1">

          {/* Session name */}
          <LabeledField label="Nombre de la sesión" error={errors.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Estudio React"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-base text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6ca2ff] transition-colors"
            />
          </LabeledField>

          {/* Duration drum pickers */}
          <LabeledField label="Duración">
            <div className="flex items-center gap-1 rounded-2xl overflow-hidden bg-[#0d1117] border border-[#30363d]">
              <DrumRollPicker
                options={minutesOptions}
                value={minutes}
                onChange={setMinutes}
                label="Minutos"
              />
              <div className="flex flex-col items-center gap-3 shrink-0 px-1">
                <span className="text-2xl font-bold text-slate-400">:</span>
              </div>
              <DrumRollPicker
                options={secondsOptions}
                value={seconds}
                onChange={setSeconds}
                format={(v) => String(v).padStart(2, "0")}
                label="Segundos"
              />
            </div>
            <div className="flex justify-around mt-1.5">
              <span className="text-xs text-slate-600 text-center w-1/2">minutos</span>
              <span className="text-xs text-slate-600 text-center w-1/2">segundos</span>
            </div>
          </LabeledField>

          {/* Pokemon picker */}
          <LabeledField label="Pokémon" error={errors.pokemon}>
            <button
              type="button"
              onClick={() => setPokemonModalOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-[#6ca2ff] transition-colors text-left"
            >
              <div className="w-14 h-14 rounded-xl bg-[#161b22] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={gifError ? DITTO_SPRITE : showdownGif(pokemonId)}
                  alt={pokemonId}
                  onError={() => setGifError(true)}
                  className="w-12 h-12 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-200 capitalize">{pokemonId}</p>
                <p className="text-sm text-slate-500 mt-0.5">Toca para cambiar →</p>
              </div>
            </button>
          </LabeledField>

          {/* Nickname */}
          <LabeledField label="Apodo (opcional)">
            <input
              value={pokemonNickname}
              onChange={(e) => setPokemonNickname(e.target.value)}
              placeholder="Ej: Sparky"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-base text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6ca2ff] transition-colors"
            />
          </LabeledField>

        </div>
      </Modal>

      <PokemonGridModal
        open={pokemonModalOpen}
        value={pokemonId}
        onChange={setPokemonId}
        onClose={() => setPokemonModalOpen(false)}
      />
    </>
  );
};
