"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Trend = {
  value: string;
  label?: string;
  direction: "up" | "down";
};

type ProgressRing = {
  current: number;
  total: number;
  centerLabel?: string;
};

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: Trend;
  ring?: ProgressRing;
  className?: string;
};

export function StatCard({ icon: Icon, label, value, trend, ring, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-(--surface) border border-(--border) rounded-(--r-card) p-4 md:p-5 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="w-8 h-8 rounded-[8px] bg-(--primary-light) flex items-center justify-center mb-3">
            <Icon size={16} className="text-(--primary)" />
          </div>

          <p className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-1">
            {label}
          </p>

          <p className="text-[22px] md:text-[24px] font-semibold text-(--text) tracking-tight leading-tight">
            {value}
          </p>

          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                trend.direction === "up"
                  ? "text-(--success) bg-(--success-bg)"
                  : "text-(--danger) bg-(--danger-bg)"
              )}
            >
              {trend.value} {trend.label && <span className="text-(--muted) font-normal">{trend.label}</span>}
            </span>
          )}
        </div>

        {ring && <ProgressRingViz current={ring.current} total={ring.total} centerLabel={ring.centerLabel} />}
      </div>
    </div>
  );
}

function ProgressRingViz({ current, total, centerLabel }: ProgressRing) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / total, 1);
  const offset = circumference - pct * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-semibold text-(--text) leading-none">
          {centerLabel ?? `${current}/${total}`}
        </span>
      </div>
    </div>
  );
}
