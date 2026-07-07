import { StatCardSkeleton } from '@/components/ui/Skeleton';
export default function DashboardLoading() {
  return (
    <div>
      <div className="h-7 w-64 bg-(--border) rounded animate-pulse mb-1" />
      <div className="h-4 w-96 bg-(--border) rounded animate-pulse mb-6" />
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-[1fr_360px] gap-3.5">
        <div className="bg-(--surface) border border-(--border) rounded-(--r-card) h-72 animate-pulse" />
        <div className="space-y-3.5">
          <div className="bg-(--surface) border border-(--border) rounded-(--r-card) h-44 animate-pulse" />
          <div className="bg-(--surface) border border-(--border) rounded-(--r-card) h-44 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
