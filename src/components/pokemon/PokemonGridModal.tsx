import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const POKE_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=1302";

function showdownName(n: string) {
  return n.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "").replace(/♀/g, "-f").replace(/♂/g, "-m");
}
function showdownGif(name: string) {
  return `https://play.pokemonshowdown.com/sprites/ani/${showdownName(name)}.gif`;
}
function staticSprite(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
function extractId(url: string) {
  const m = url.match(/\/pokemon\/(\d+)\//);
  return m ? Number(m[1]) : 0;
}

interface Pokemon { name: string; id: number }

interface Props {
  open: boolean;
  value?: string;
  onChange: (name: string) => void;
  onClose: () => void;
}

export function PokemonGridModal({ open, value, onChange, onClose }: Props) {
  const [options, setOptions] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load pokemon list once
  useEffect(() => {
    if (options.length > 0) return;
    let mounted = true;
    setLoading(true);
    fetch(POKE_LIST_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setOptions(
          (data.results as Array<{ name: string; url: string }>).map((p) => ({
            name: p.name,
            id: extractId(p.url),
          }))
        );
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [options.length]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.name.includes(q)) : options;
    return list.slice(0, q ? 200 : 150);
  }, [options, query]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Sheet */}
      <div
        className="flex flex-col mt-auto w-full rounded-t-3xl animate-slide-up overflow-hidden"
        style={{
          height: "88dvh",
          background: "linear-gradient(180deg, #131a24 0%, #0d1117 100%)",
          border: "1px solid rgba(108,162,255,0.12)",
          borderBottom: "none",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 flex-shrink-0">
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar Pokémon..."
            className="flex-1 px-4 py-3 text-base rounded-2xl bg-[#0d1117] border border-[#30363d] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6ca2ff] transition-colors"
          />
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
              Cargando Pokémon...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
              Sin resultados para "{query}"
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((pokemon) => {
                const isSelected = pokemon.name === value;
                return (
                  <PokemonCell
                    key={pokemon.name}
                    pokemon={pokemon}
                    isSelected={isSelected}
                    onSelect={() => { onChange(pokemon.name); onClose(); }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PokemonCell({
  pokemon,
  isSelected,
  onSelect,
}: {
  pokemon: Pokemon;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(() => showdownGif(pokemon.name));
  const triedFallback = useRef(false);

  const handleError = () => {
    if (triedFallback.current) return;
    triedFallback.current = true;
    setImgSrc(staticSprite(pokemon.id));
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all duration-150 active:scale-95
        ${isSelected
          ? "border-[#6ca2ff] bg-[#6ca2ff]/15 shadow-[0_0_12px_rgba(108,162,255,0.2)]"
          : "border-[#1e2736] bg-[#161b22] hover:border-[#30363d]"
        }`}
    >
      <div className="w-full aspect-square flex items-center justify-center">
        <img
          src={imgSrc}
          alt={pokemon.name}
          loading="lazy"
          onError={handleError}
          className="w-16 h-16 object-contain"
          draggable={false}
        />
      </div>
      <span
        className={`text-[11px] font-medium capitalize leading-tight text-center w-full truncate
          ${isSelected ? "text-[#6ca2ff]" : "text-slate-400"}`}
      >
        {pokemon.name}
      </span>
      {isSelected && (
        <span className="text-[#6ca2ff] text-xs leading-none">✓</span>
      )}
    </button>
  );
}
