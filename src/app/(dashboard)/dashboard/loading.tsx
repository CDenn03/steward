import { StatCardSkeleton } from "@/components/ui/skeleton";
export default function DashboardLoading() {
  return (
    <div>
      <div className="h-7 w-64 bg-[var(--border)] rounded animate-pulse mb-1" />
      <div className="h-4 w-96 bg-[var(--border)] rounded animate-pulse mb-6" />
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-[1fr_360px] gap-3.5">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] h-72 animate-pulse" />
        <div className="space-y-3.5">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] h-44 animate-pulse" />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] h-44 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
