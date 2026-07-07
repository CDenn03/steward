"use client";

import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

interface BudgetStatusFlowProps {
  status: BudgetStatus;
  className?: string;
}

const steps: { status: BudgetStatus[]; label: string; description: string }[] = [
  { status: ["draft"], label: "Draft", description: "Being prepared" },
  { status: ["submitted"], label: "Submitted", description: "Awaiting finance review" },
  { status: ["needs_changes"], label: "In Review", description: "Changes requested" },
  { status: ["finance_approved"], label: "Finance ✓", description: "Awaiting chair approval" },
  { status: ["chair_approved"], label: "Approved", description: "Budget activated" },
];

function getStepIndex(status: BudgetStatus): number {
  if (status === "rejected") return -1;
  return steps.findIndex((s) => s.status.includes(status));
}

export function BudgetStatusFlow({ status, className }: Readonly<BudgetStatusFlowProps>) {
  const current = getStepIndex(status);
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 text-danger text-[12px]">
        <span className="w-2 h-2 rounded-full bg-danger" /> {" "}
        Budget has been rejected
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-0", className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors",
                  done && "bg-success text-white",
                  active && "bg-(--primary) text-white ring-4 ring-[var(--primary-light)]",
                  !done && !active && "bg-(--border) text-(--muted)"
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={cn("text-[10px] font-medium whitespace-nowrap",
                active ? "text-(--primary)" : done ? "text-success" : "text-(--muted)"
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 w-10 mx-1 mb-4 transition-colors", done ? "bg-success" : "bg-(--border)")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
