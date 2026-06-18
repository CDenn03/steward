import { requireSession } from "@/lib/auth/session";
import { getBudgetAnalytics } from "@/features/budgets/repositories";
import { getIncomeMonthlyBreakdown } from "@/features/finance/repositories";
import { AnalyticsClient } from "./analytics-client";

type BudgetAnalyticsRow = {
  id: string;
  name: string;
  budgets: Array<{
    items: Array<{ totalCost: number }>;
    expenditures: Array<{ totalClaimed: number }>;
  }>;
};

export default async function AnalyticsPage() {
  const session = await requireSession();
  const [departments, monthlyIncome] = await Promise.all([
    getBudgetAnalytics(session.organizationId),
    getIncomeMonthlyBreakdown(session.organizationId),
  ]);

  const departmentSpend = (departments as BudgetAnalyticsRow[])
    .map((department) => {
      const allocated = department.budgets.reduce(
        (sum, budget) => sum + budget.items.reduce((itemSum, item) => itemSum + item.totalCost, 0),
        0
      );
      const spent = department.budgets.reduce(
        (sum, budget) => sum + budget.expenditures.reduce((reportSum, report) => reportSum + report.totalClaimed, 0),
        0
      );
      return {
        id: department.id,
        name: department.name.split(" ")[0],
        allocated,
        spent,
        variance: allocated - spent,
      };
    })
    .filter((department) => department.allocated > 0);

  return (
    <AnalyticsClient
      departmentSpend={departmentSpend}
      monthlyIncome={monthlyIncome}
      currency={session.organization.currency}
    />
  );
}
