import { useState, useEffect } from "react";

export const TYPE_COLORS: Record<string, string> = {
  fire:     "#f97316",
  water:    "#60a5fa",
  grass:    "#4ade80",
  electric: "#fbbf24",
  psychic:  "#f472b6",
  ice:      "#67e8f9",
  dragon:   "#818cf8",
  dark:     "#a8a29e",
  ghost:    "#a78bfa",
  fighting: "#f87171",
  normal:   "#94a3b8",
  poison:   "#c084fc",
  ground:   "#d97706",
  flying:   "#93c5fd",
  bug:      "#86efac",
  rock:     "#b5a06e",
  steel:    "#94a3b8",
  fairy:    "#fb7185",
};

const DEFAULT_COLOR = "#6ca2ff";
const CACHE_KEY = "poke_type_cache";

// Module-level in-memory cache (survives re-renders, not page reload)
const memCache = new Map<string, string>();
try {
  const stored = localStorage.getItem(CACHE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as Record<string, string>;
    Object.entries(parsed).forEach(([k, v]) => memCache.set(k, v));
  }
} catch { /* ignore */ }

function persist() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(memCache)));
  } catch { /* ignore */ }
}

export function typeToColor(type: string | null | undefined): string {
  return type ? (TYPE_COLORS[type] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
}

/** Converts a #rrggbb hex string to "r g b" for use with rgb(var / alpha%) */
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Fetches and caches the primary type of a Pokemon, returns its accent color.
 * Falls back to the app's default blue while loading or on error.
 * Workbox CacheFirst means subsequent fetches come from the SW cache.
 */
export function usePokeType(pokemonId: string): string {
  const [color, setColor] = useState<string>(() =>
    typeToColor(memCache.get(pokemonId) ?? null)
  );

  useEffect(() => {
    // Already cached — update synchronously and bail
    const cached = memCache.get(pokemonId);
    if (cached) {
      setColor(typeToColor(cached));
      return;
    }

    const controller = new AbortController();
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { types?: Array<{ type: { name: string } }> }) => {
        const type = data.types?.[0]?.type?.name ?? "normal";
        memCache.set(pokemonId, type);
        persist();
        setColor(typeToColor(type));
      })
      .catch(() => { /* keep default color on error */ });

    return () => controller.abort();
  }, [pokemonId]);

  return color;
}
