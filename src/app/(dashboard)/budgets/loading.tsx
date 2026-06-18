export default function BudgetsLoading() {
  return (
    <div>
      <div className="h-7 w-40 bg-(--border) rounded animate-pulse mb-5" />
      <div className="grid grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-(--surface) border border-(--border) rounded-(--r-card) h-20 animate-pulse" />
        ))}
      </div>
      <div className="bg-(--surface) border border-(--border) rounded-(--r-card) h-96 animate-pulse" />
    </div>
  );
}
