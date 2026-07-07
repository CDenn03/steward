import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getBudgetById, getBudgetFormOptions } from "@/features/budgets/repositories";
import { EditBudgetForm } from './EditBudgetForm';

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ budgetId: string }>;
}) {
  const { budgetId } = await params;
  const session = await requireSession();
  const [budget, options] = await Promise.all([
    getBudgetById(budgetId, session.organizationId),
    getBudgetFormOptions(session.organizationId),
  ]);
  if (!budget) notFound();

  if (budget.status !== "DRAFT" && budget.status !== "NEEDS_CHANGES") {
    throw new Error("Only draft or needs-changes budgets can be edited");
  }

  return (
    <EditBudgetForm
      budget={budget}
      departments={options.departments}
      events={options.events}
      categories={options.categories}
    />
  );
}
