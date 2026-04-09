import { useState, useEffect } from "react";

export const SPECIES_COLORS: Record<string, string> = {
  black:  "#6b7280",
  blue:   "#60a5fa",
  brown:  "#d97706",
  gray:   "#94a3b8",
  green:  "#4ade80",
  pink:   "#f472b6",
  purple: "#a78bfa",
  red:    "#f87171",
  white:  "#e2e8f0",
  yellow: "#fbbf24",
};

const DEFAULT_COLOR = "#6ca2ff";
const CACHE_KEY = "poke_species_color_cache";

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

export function speciesToColor(speciesColor: string | null | undefined): string {
  return speciesColor ? (SPECIES_COLORS[speciesColor] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
}

/** Converts a #rrggbb hex string to "r g b" for use with rgb(var / alpha%) */
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Fetches and caches the species color of a Pokemon, returns its accent color.
 * Falls back to the app's default blue while loading or on error.
 * Workbox CacheFirst means subsequent fetches come from the SW cache.
 */
export function usePokeType(pokemonId: string): string {
  const [color, setColor] = useState<string>(() =>
    speciesToColor(memCache.get(pokemonId) ?? null)
  );

  useEffect(() => {
    // Already cached — update synchronously and bail
    const cached = memCache.get(pokemonId);
    if (cached) {
      setColor(speciesToColor(cached));
      return;
    }

    const controller = new AbortController();
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { color?: { name: string } }) => {
        const speciesColor = data.color?.name ?? "blue";
        memCache.set(pokemonId, speciesColor);
        persist();
        setColor(speciesToColor(speciesColor));
      })
      .catch(() => { /* keep default color on error */ });

    return () => controller.abort();
  }, [pokemonId]);

  return color;
}
