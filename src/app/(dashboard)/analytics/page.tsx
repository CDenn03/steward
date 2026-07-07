import { requireSession } from "@/lib/auth/session";
import { getBudgetAnalytics } from "@/features/budgets/repositories";
import { getIncomeMonthlyBreakdown } from "@/features/finance/repositories";
import { AnalyticsClient } from './AnalyticsClient';

type BudgetAnalyticsRow = {
  id: string;
  name: string;
  budgets: Array<{
    items: Array<{ totalCost: number }>;
    expenditures: Array<{ totalClaimed: number }>;
  }>;
};

export default async function AnalyticsPage(props: { searchParams?: Promise<{ year?: string }> }) {
  const session = await requireSession();
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = Number.parseInt(searchParams?.year ?? "") || currentYear;
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [departments, monthlyIncome] = await Promise.all([
    getBudgetAnalytics(session.organizationId),
    getIncomeMonthlyBreakdown(session.organizationId, year),
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
      years={years}
      selectedYear={year}
    />
  );
}
