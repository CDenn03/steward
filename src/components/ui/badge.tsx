import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

const statusConfig: Record<
  BudgetStatus | "under_review" | "approved",
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-draft-bg text-draft" },
  submitted: { label: "Submitted", className: "bg-info-bg text-info" },
  needs_changes: { label: "Needs Changes", className: "bg-warning-bg text-warning" },
  finance_approved: { label: "Finance Approved", className: "bg-primary-light text-primary" },
  chair_approved: { label: "Approved", className: "bg-success-bg text-success" },
  rejected: { label: "Rejected", className: "bg-danger-bg text-danger" },
  under_review: { label: "Under Review", className: "bg-info-bg text-info" },
  approved: { label: "Approved", className: "bg-success-bg text-success" },
};

interface StatusBadgeProps {
  status: BudgetStatus | "under_review" | "approved";
  className?: string;
}

export function StatusBadge({ status, className }: Readonly<StatusBadgeProps>) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold" | "draft";
  className?: string;
}

const variantClasses = {
  default: "bg-[var(--primary-light)] text-(--primary)",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  gold: "bg-[var(--gold-light)] text-[var(--gold)]",
  draft: "bg-draft-bg text-draft",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
