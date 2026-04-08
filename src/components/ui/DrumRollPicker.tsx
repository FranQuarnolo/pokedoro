import { useEffect, useRef, useState } from "react";

const ITEM_H = 56; // px per item
const VISIBLE = 5; // visible items
const PADDING = Math.floor(VISIBLE / 2); // 2 ghost items on each side

interface DrumRollPickerProps {
  options: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  label: string;
}

export function DrumRollPicker({ options, value, onChange, format, label }: DrumRollPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [localIndex, setLocalIndex] = useState(() => Math.max(0, options.indexOf(value)));

  // Set initial scroll position (no animation) on mount
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !scrollRef.current) return;
    const idx = Math.max(0, options.indexOf(value));
    scrollRef.current.scrollTop = idx * ITEM_H;
    initialized.current = true;
  });

  // Scroll to value when it changes externally (e.g. modal reset)
  useEffect(() => {
    if (isUserScrolling.current || !scrollRef.current) return;
    const idx = Math.max(0, options.indexOf(value));
    const currentIdx = Math.round(scrollRef.current.scrollTop / ITEM_H);
    if (currentIdx === idx) return;
    scrollRef.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    setLocalIndex(idx);
  }, [value, options]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.max(0, Math.min(
      Math.round(scrollRef.current.scrollTop / ITEM_H),
      options.length - 1
    ));
    setLocalIndex(idx);
    isUserScrolling.current = true;
    clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      isUserScrolling.current = false;
      onChange(options[idx]);
    }, 150);
  };

  const handleItemClick = (idx: number) => {
    scrollRef.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    setLocalIndex(idx);
    clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      onChange(options[idx]);
    }, 350);
  };

  return (
    <div className="relative flex-1 select-none" style={{ height: VISIBLE * ITEM_H }} aria-label={label}>
      {/* Center selection highlight */}
      <div
        className="absolute inset-x-0 pointer-events-none z-10 border-y border-[#6ca2ff]/40 bg-[#6ca2ff]/8 rounded-lg"
        style={{ top: PADDING * ITEM_H, height: ITEM_H }}
      />

      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-10"
        style={{
          height: PADDING * ITEM_H,
          background: "linear-gradient(to bottom, #0d1117 10%, transparent)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: PADDING * ITEM_H,
          background: "linear-gradient(to top, #0d1117 10%, transparent)",
        }}
      />

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="drum-scroll h-full overflow-y-auto"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Top padding */}
        {Array.from({ length: PADDING }, (_, i) => (
          <div key={`pt${i}`} style={{ height: ITEM_H }} />
        ))}

        {options.map((opt, i) => {
          const dist = Math.abs(i - localIndex);
          const isSelected = i === localIndex;
          return (
            <div
              key={opt}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className="flex items-center justify-center cursor-pointer transition-all duration-150"
              onClick={() => handleItemClick(i)}
            >
              <span
                className="transition-all duration-150 font-mono"
                style={{
                  fontSize: isSelected ? "2rem" : dist === 1 ? "1.3rem" : "1rem",
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected
                    ? "#e6edf3"
                    : dist === 1
                    ? "rgba(230,237,243,0.45)"
                    : "rgba(230,237,243,0.18)",
                }}
              >
                {format ? format(opt) : opt}
              </span>
            </div>
          );
        })}

        {/* Bottom padding */}
        {Array.from({ length: PADDING }, (_, i) => (
          <div key={`pb${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
}
