import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[12px] font-medium text-(--text)">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
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
        {error && <p className="text-[11px] text-danger">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
