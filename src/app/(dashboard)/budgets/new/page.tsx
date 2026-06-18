import { requireSession } from "@/lib/auth/session";
import { getBudgetFormOptions } from "@/features/budgets/repositories";
import { getDepartmentAllocations } from "@/features/departments/services";
import { NewBudgetForm } from "./new-budget-form";

export default async function NewBudgetPage() {
  const session = await requireSession();
  const [options, allocations] = await Promise.all([
    getBudgetFormOptions(session.organizationId),
    getDepartmentAllocations(session.organizationId),
  ]);

  return (
    <NewBudgetForm
      departments={options.departments}
      events={options.events}
      categories={options.categories}
      departmentAllocations={allocations}
    />
  );
}
