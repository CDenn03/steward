import { cn } from "@/lib/utils";
import { ProgressBar } from './Progress';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  progress?: number;
  progressLabel?: string;
  accentColor?: "primary" | "success" | "warning" | "gold";
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  progress,
  progressLabel,
  accentColor = "primary",
  className,
}: Readonly<StatCardProps>) {
  const accentClass =
    accentColor === "success"
      ? "bg-success-bg text-success"
      : accentColor === "warning"
      ? "bg-warning-bg text-warning"
      : accentColor === "gold"
      ? "bg-[var(--gold-light)] text-[var(--gold)]"
      : "bg-[var(--primary-light)] text-(--primary)";

  const valueClass =
    accentColor === "warning" ? "text-warning" : "text-(--text)";

  return (
    <div
      className={cn(
        "bg-(--surface) border border-(--border) rounded-(--r-card) p-5",
        className
      )}
    >
      <p className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.6px] mb-2.5">
        {label}
      </p>
      <p
        className={cn(
          "text-[22px] font-semibold tracking-tight tabular-nums leading-none",
          valueClass
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[12px] text-(--muted)">
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              "text-[11px] font-medium px-1.5 py-0.5 rounded",
              delta > 0
                ? "bg-success-bg text-success"
                : delta < 0
                ? "bg-danger-bg text-danger"
                : accentClass
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}
            {typeof delta === "number" && !deltaLabel?.includes("%") ? "%" : ""}
          </span>
        )}
        {deltaLabel && <span>{deltaLabel}</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <ProgressBar value={progress} />
          {progressLabel && (
            <p className="text-[10px] text-(--muted) mt-1">{progressLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
