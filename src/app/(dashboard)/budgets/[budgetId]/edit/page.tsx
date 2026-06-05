"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockBudgets } from "@/lib/mock/data";

export default function EditBudgetPage({ params }: { params: Promise<{ budgetId: string }> }) {
  const { budgetId } = use(params);
  const budget = mockBudgets.find((b) => b.id === budgetId) ?? mockBudgets[0];
  return (
    <div>
      <Link href={`/budgets/${budgetId}`} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-5">
        <ArrowLeft size={13} /> Back to Budget
      </Link>
      <h1 className="text-[20px] font-semibold mb-2">Edit: {budget.title}</h1>
      <p className="text-[13px] text-[var(--muted)]">Shares the same form structure as New Budget.</p>
    </div>
  );
}
