import React, { useEffect, useState } from "react";
import styles from "./PokemonSprite.module.css";

const BASE_URL = "https://play.pokemonshowdown.com/sprites";

function showdownName(n: string) {
  return n
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m");
}
function showdownGif(name: string) {
  return `${BASE_URL}/ani/${showdownName(name)}.gif`;
}
function pokeapiPngById(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
async function fetchIdByName(name: string): Promise<number | null> {
  try {
    const r = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${showdownName(name)}`
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j?.id ?? null;
  } catch {
    return null;
  }
}

interface Props {
  pokemonId: string; // nombre: "fearow"
  isTimerRunning: boolean; // solo para futuras microinteracciones si querés
}

export const PokemonSprite: React.FC<Props> = ({ pokemonId }) => {
  const [src, setSrc] = useState<string>(() => showdownGif(pokemonId));
  const [bump, setBump] = useState(0);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setSrc(showdownGif(pokemonId));
    setBump((k) => k + 1);
    setTriedFallback(false);
  }, [pokemonId]);

  const handleError = async () => {
    if (triedFallback) return;
    setTriedFallback(true);
    const id = await fetchIdByName(pokemonId);
    if (id) setSrc(pokeapiPngById(id));
  };

  return (
    <img
      key={src + bump}
      src={src}
      alt={`${pokemonId} sprite`}
      onError={handleError}
      className={`${styles.sprite} ${styles.center} ${styles.idleAnim ?? ""}`}
      draggable={false}
    />
  );
};
