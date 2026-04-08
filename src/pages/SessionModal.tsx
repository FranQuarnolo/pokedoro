import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { PokemonSelector } from "../components/pokemon/PokemonSelector";
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
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6ca2ff] transition-colors"
      {...rest}
    />
  );
}

const minutesOptions = Array.from({ length: 181 }, (_, i) => i);
const secondsOptions = Array.from({ length: 60 }, (_, i) => i);

function WheelSelect({
  options,
  value,
  onChange,
  format,
  label,
}: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  label: string;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  return (
    <select
      ref={selectRef}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 px-3 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-sm text-slate-200 focus:outline-none focus:border-[#6ca2ff] transition-colors text-center appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {format ? format(o) : String(o)}
        </option>
      ))}
    </select>
  );
}

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

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setPokemonId(initialValues?.pokemonId ?? "pikachu");
    setPokemonNickname(initialValues?.pokemonNickname ?? "");
    setMinutes(initMinSec.m);
    setSeconds(initMinSec.s);
    setErrors({});
  }, [open, initialValues, initMinSec]);

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

  const title = mode === "create" ? "Crear Pokedoro" : "Configurar Sesión";
  const okText = mode === "create" ? "Crear" : "Guardar";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>{okText}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <LabeledField label="Nombre de la sesión" error={errors.name}>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Estudio React"
          />
        </LabeledField>

        <LabeledField label="Duración">
          <div className="flex items-center gap-2">
            <WheelSelect
              options={minutesOptions}
              value={minutes}
              onChange={setMinutes}
              label="Minutos"
            />
            <span className="text-xl font-bold text-slate-400 flex-shrink-0">:</span>
            <WheelSelect
              options={secondsOptions}
              value={seconds}
              onChange={setSeconds}
              format={(v) => String(v).padStart(2, "0")}
              label="Segundos"
            />
          </div>
          <p className="text-xs text-slate-500 text-center mt-1">minutos — segundos</p>
        </LabeledField>

        <LabeledField label="Pokémon" error={errors.pokemon}>
          <PokemonSelector
            value={pokemonId}
            onChange={setPokemonId}
            placeholder="Ej: pikachu, gengar, snorlax"
          />
        </LabeledField>

        <LabeledField label="Apodo (opcional)">
          <TextInput
            value={pokemonNickname}
            onChange={(e) => setPokemonNickname(e.target.value)}
            placeholder="Ej: Pikachu de Juan"
          />
        </LabeledField>
      </div>
    </Modal>
  );
};
