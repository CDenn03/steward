import { requireSession } from "@/lib/auth/session";
import { getBudgetsByOrg } from "@/features/budgets/repositories";
import { NewExpenditureForm } from "./new-expenditure-form";

export default async function NewExpenditurePage() {
  const session = await requireSession();
  const budgets = await getBudgetsByOrg(session.organizationId);

  type RawBudget = {
    id: string;
    title: string;
    status: string;
    department: { name: string } | null;
    items: Array<{ id: string; description: string; totalCost: number; category: { name: string } | null }>;
  };

  const eligible = (budgets as RawBudget[]).filter(
    (b) => b.status === "CHAIR_APPROVED"
  ).map((b) => ({
    id: b.id,
    title: b.title,
    department: b.department?.name ?? "General",
    items: b.items.map((item) => ({
      id: item.id,
      description: item.description,
      totalCost: item.totalCost,
      category: item.category?.name ?? null,
    })),
  }));

  return <NewExpenditureForm budgets={eligible} />;
}
