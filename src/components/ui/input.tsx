import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[12px] font-medium text-[var(--text)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--muted)">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-(--surface) border border-(--border) rounded-(--r-input)",
              "px-3 py-2 text-[13px] text-[var(--text)] placeholder:text-(--muted)",
              "outline-none transition-all duration-150",
              "focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20",
              icon && "pl-8",
              error && "border-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
