import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getBudgetById } from "@/features/budgets/repositories";
import { formatCurrency } from "@/lib/utils";

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ budgetId: string }>;
}) {
  const { budgetId } = await params;
  const session = await requireSession();
  const budget = await getBudgetById(budgetId, session.organizationId);
  if (!budget) notFound();

  const total = budget.items.reduce(
    (sum: number, item: { totalCost: number }) => sum + item.totalCost,
    0
  );

  return (
    <div>
      <Link href={`/budgets/${budgetId}`} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-5">
        <ArrowLeft size={13} /> Back to Budget
      </Link>
      <h1 className="text-[20px] font-semibold mb-2">Edit: {budget.title}</h1>
      <p className="text-[13px] text-[var(--muted)]">
        Current total {formatCurrency(total, session.organization.currency)} across {budget.items.length} line item{budget.items.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
