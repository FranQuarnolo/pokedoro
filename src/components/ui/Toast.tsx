import { useEffect, useRef, useState, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "info" | "error";

interface ToastItem {
  id: number;
  message: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (opts: { message: string; description?: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

const ICONS: Record<ToastType, string> = {
  success: "✓",
  info: "✦",
  error: "✕",
};

const COLORS: Record<ToastType, string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  info: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  error: "border-red-500/40 bg-red-500/10 text-red-300",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "bg-emerald-500/20 text-emerald-400",
  info: "bg-blue-500/20 text-blue-400",
  error: "bg-red-500/20 text-red-400",
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300);
    }, 3500);
    return () => clearTimeout(timerRef.current);
  }, [item.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg transition-all duration-300
        ${COLORS[item.type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${ICON_COLORS[item.type]}`}>
        {ICONS[item.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 leading-tight">{item.message}</p>
        {item.description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.description}</p>
        )}
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem item={t} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ message, description, type = "info" }: { message: string; description?: string; type?: ToastType }) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev.slice(-3), { id, message, description, type }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
