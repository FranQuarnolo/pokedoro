import React, { useEffect, useMemo, useRef, useState } from "react";

type Option = { value: string; label: string; id: number; sprite: string };

const POKE_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=1302";

function extractIdFromUrl(url: string): number {
  const m = url.match(/\/pokemon\/(\d+)\//);
  return m ? Number(m[1]) : 0;
}

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export interface PokemonSelectorProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

export const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  value,
  onChange,
  placeholder = "Buscar Pokémon...",
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(POKE_LIST_URL);
        const data = await res.json();
        if (!mounted) return;
        const opts: Option[] = (data.results as Array<{ name: string; url: string }>).map((p) => {
          const id = extractIdFromUrl(p.url);
          return { value: p.name, label: p.name, id, sprite: spriteUrl(id) };
        });
        setOptions(opts);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(
    () =>
      query.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 80)
        : options.slice(0, 80),
    [options, query]
  );

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt: Option) => {
    onChange?.(opt.value);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { if (filtered[highlighted]) handleSelect(filtered[highlighted]); }
    else if (e.key === "Escape") setOpen(false);
  };

  // Scroll highlighted into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger / selected display */}
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-left text-sm text-slate-200 focus:outline-none focus:border-[#6ca2ff] transition-colors"
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        onKeyDown={handleKeyDown}
      >
        {selectedOption ? (
          <>
            <img src={selectedOption.sprite} alt="" className="w-6 h-6 object-contain" />
            <span className="capitalize flex-1 truncate">{selectedOption.label}</span>
          </>
        ) : (
          <span className="flex-1 text-slate-500">{loading ? "Cargando Pokémon..." : placeholder}</span>
        )}
        <span className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-[#30363d]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Buscar..."
              className="w-full px-3 py-2 text-sm bg-[#0d1117] border border-[#30363d] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6ca2ff]"
            />
          </div>
          <div ref={listRef} className="overflow-y-auto max-h-64">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">Sin resultados</div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                    ${i === highlighted ? "bg-[#6ca2ff]/10 text-[#6ca2ff]" : "text-slate-300 hover:bg-white/5"}
                    ${value === opt.value ? "bg-[#6ca2ff]/5" : ""}
                  `}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                >
                  <img src={opt.sprite} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                  <span className="capitalize">{opt.label}</span>
                  {value === opt.value && <span className="ml-auto text-[#6ca2ff] text-xs">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
