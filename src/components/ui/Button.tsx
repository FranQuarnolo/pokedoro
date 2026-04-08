import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-95 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#6ca2ff] text-[#0d1117] hover:bg-[#85b3ff] focus-visible:ring-[#6ca2ff] shadow-[0_0_16px_rgba(108,162,255,0.3)] hover:shadow-[0_0_24px_rgba(108,162,255,0.45)]",
      secondary:
        "bg-[#1b222b] text-slate-200 border border-[#30363d] hover:bg-[#222b36] hover:border-[#4a5568] focus-visible:ring-slate-500",
      ghost:
        "bg-transparent text-slate-300 hover:bg-white/5 focus-visible:ring-slate-500",
      danger:
        "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "text-sm px-3 py-2 gap-1.5",
      md: "text-base px-4 py-3 gap-2",
      lg: "text-base px-5 py-4 gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
