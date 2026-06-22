import { cn } from "@/lib/utils";

export function Skeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("animate-pulse bg-(--border) rounded-md", className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-(--surface) border border-(--border) rounded-(--r-card) p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-36 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: Readonly<{ cols?: number }>) {
  return (
    <tr className="border-b border-(--border)">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
