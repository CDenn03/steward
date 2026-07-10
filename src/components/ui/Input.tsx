import { cn } from "@/lib/utils";
import { forwardRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

function generateId(label?: string) {
  if (!label) return undefined;
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id: idProp, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = idProp || (label ? generateId(label) : fallbackId);
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-(--text)">
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
            id={inputId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "w-full bg-(--surface) border border-(--border) rounded-(--r-input)",
              "px-3 py-2 text-[14px] text-(--text) placeholder:text-(--muted)",
              "outline-none transition-all duration-150",
              "focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20",
              icon && "pl-8",
              error && "border-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-[12px] text-(--danger)">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
