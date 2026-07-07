import { cn } from "@/lib/utils";
import { forwardRef, useId } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

function generateId(label?: string) {
  if (!label) return undefined;
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id: idProp, ...props }, ref) => {
    const fallbackId = useId();
    const textareaId = idProp || (label ? generateId(label) : fallbackId);
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-[12px] font-medium text-(--text)">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "w-full bg-(--surface) border border-(--border) rounded-(--r-input)",
            "px-3 py-2 text-[13px] text-(--text) placeholder:text-(--muted)",
            "outline-none transition-all duration-150 resize-none",
            "focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20",
            error && "border-danger",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-[11px] text-(--danger)">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
