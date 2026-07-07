import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getBudgetsByOrg } from "@/features/budgets/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { BudgetsTable } from '@/features/budgets/components/BudgetsTable';

export default async function BudgetsPage() {
  const session = await requireSession();
  const raw = await getBudgetsByOrg(session.organizationId);

  type RawBudget = {
    id: string;
    title: string;
    status: string;
    department: { name: string } | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    items: Array<{ totalCost: number }>;
    updatedAt: Date;
  };

  const budgets = (raw as RawBudget[]).map((b: RawBudget) => ({
    id: b.id,
    title: b.title,
    status: b.status.toLowerCase() as string,
    department: b.department ? { name: b.department.name } : null,
    periodStart: b.periodStart,
    periodEnd: b.periodEnd,
    totalAmount: b.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0),
    updatedAt: b.updatedAt,
  }));

  const summary = {
    total: budgets.length,
    approved: budgets.filter((b: { status: string }) => b.status === "chair_approved").length,
    pending: budgets.filter((b: { status: string }) => b.status === "submitted" || b.status === "finance_approved").length,
    totalAllocated: budgets.reduce((sum: number, b: { totalAmount: number }) => sum + b.totalAmount, 0),
  };

  return (
    <>
      <PageHeader title="Budgets" subtitle="Manage and track all department and event budgets">
        <Link href="/budgets/new">
          <Button size="sm"><Plus size={13} /> New Budget</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Budgets",    value: summary.total,           sub: "This cycle" },
          { label: "Approved",         value: summary.approved,        sub: "Fully approved" },
          { label: "Pending Review",   value: summary.pending,         sub: "In review queue" },
          { label: "Total Allocated",  value: summary.totalAllocated,  sub: "All budgets combined", isCurrency: true },
        ].map((s) => (
          <div key={s.label} className="bg-(--surface) border border-(--border) rounded-(--r-card) px-4 py-3.5">
            <p className="text-[11px] text-(--muted) uppercase tracking-[0.5px] font-medium">{s.label}</p>
            <p className="text-[20px] font-semibold tracking-tight mt-1">
              {s.isCurrency
                ? new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 }).format(s.value as number)
                : s.value}
            </p>
            <p className="text-[11px] text-(--muted) mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <BudgetsTable budgets={budgets} />
    </>
  );
}
