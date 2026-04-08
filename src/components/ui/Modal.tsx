import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: "radial-gradient(ellipse at top, #1a2233 0%, #0d1117 100%)",
          border: "1px solid rgba(108,162,255,0.15)",
          boxShadow: "0 0 40px rgba(108,162,255,0.1), 0 24px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {title && (
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          </div>
        )}

        <div className="px-5 py-3">{children}</div>

        {footer && (
          <div className="px-5 pb-6 pt-2 flex gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
