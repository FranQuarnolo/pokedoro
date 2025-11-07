 
import React, { useEffect, useMemo, useState } from "react";
import { Select, Avatar } from "antd";

type Option = { value: string; label: string; id: number; sprite: string };

// PokeAPI returns paginated list. We fetch all names with a large limit.
const POKE_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=1302";

function extractIdFromUrl(url: string): number {
  const m = url.match(/\/pokemon\/(\d+)\//);
  return m ? Number(m[1]) : 0;
}

function spriteUrl(id: number) {
  // Lightweight static sprite from PokeAPI repo
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export interface PokemonSelectorProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  value,
  onChange,
  placeholder = "Buscar Pokémon...",
  style,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

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
          return {
            value: p.name, // usamos el nombre como clave externa
            label: p.name,
            id,
            sprite: spriteUrl(id),
          };
        });
        setOptions(opts);
      } catch (e) {
        // no-op
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredOptions = useMemo(() => options, [options]);

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      loading={loading}
      optionFilterProp="label"
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
      virtual
      listHeight={320}
      options={filteredOptions.map((o) => ({
        value: o.value,
        label: o.label,
        // custom render in dropdown via 'label' in optionRender for antd v5
      }))}
      optionRender={(option) => {
        const o = options.find((x) => x.value === option.value);
        if (!o) return option.label;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size={24} src={o.sprite} shape="square" />
            <span style={{ textTransform: "capitalize" }}>{o.label}</span>
          </div>
        );
      }}
      // how the selected value shows in the input
      labelRender={(props) => {
        const o = options.find((x) => x.value === props.value);
        if (!o) return <span>{props.label}</span>;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size={18} src={o.sprite} shape="square" />
            <span style={{ textTransform: "capitalize" }}>{o.label}</span>
          </div>
        );
      }}
    />
  );
};
