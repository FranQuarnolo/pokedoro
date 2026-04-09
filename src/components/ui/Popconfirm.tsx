import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface PopconfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  children: React.ReactElement;
}

export function Popconfirm({ title, description, onConfirm, children }: PopconfirmProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const POPUP_W = 240; // matches w-60
    const GAP = 8;
    const rawLeft = rect.left + rect.width / 2 + window.scrollX;
    const clampedLeft = Math.max(
      POPUP_W / 2 + GAP,
      Math.min(rawLeft, window.innerWidth - POPUP_W / 2 - GAP)
    );
    setPos({
      top: rect.top + window.scrollY - 10,
      left: clampedLeft,
    });
    setOpen(true);
  };

  const cloned = (
    <span ref={triggerRef as React.Ref<HTMLSpanElement>} onClick={handleTrigger} className="inline-flex">
      {children}
    </span>
  );

  return (
    <>
      {cloned}
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="fixed z-50 w-60 rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl p-3"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-sm font-semibold text-slate-200 mb-1">{title}</p>
            {description && <p className="text-xs text-slate-400 mb-3">{description}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
