import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: "sm" | "md";
}

export function ProgressBar({ value, className, size = "sm" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    clamped >= 95
      ? "bg-danger"
      : clamped >= 80
      ? "bg-warning"
      : "bg-[var(--primary)]";

  return (
    <div
      className={cn(
        "w-full bg-[var(--border)] rounded-full overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
