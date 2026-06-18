import { requireSession } from "@/lib/auth/session";
import { getBudgetFormOptions } from "@/features/budgets/repositories";
import { NewBudgetForm } from "./new-budget-form";

export default async function NewBudgetPage() {
  const session = await requireSession();
  const options = await getBudgetFormOptions(session.organizationId);

  return (
    <NewBudgetForm
      departments={options.departments}
      events={options.events}
      categories={options.categories}
    />
  );
}
