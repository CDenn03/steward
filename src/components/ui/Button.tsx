import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses = {
  primary:
    "bg-(--primary) text-white border border-(--primary) hover:bg-[#3A5240] active:scale-[0.98]",
  ghost:
    "bg-transparent text-(--muted) border border-(--border) hover:bg-(--bg) hover:text-(--text) active:scale-[0.98]",
  danger:
    "bg-transparent text-(--danger) border border-(--danger) hover:bg-(--danger-bg) active:scale-[0.98]",
  outline:
    "bg-transparent text-(--primary) border border-(--primary) hover:bg-(--primary-light) active:scale-[0.98]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-[13px] gap-1.5",
  md: "px-3.5 py-1.5 text-[14px] gap-2",
  lg: "px-4 py-2 text-[14px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-[var(--r-btn)] transition-all duration-150 cursor-pointer whitespace-nowrap select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
