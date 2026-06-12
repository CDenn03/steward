import { prisma } from "@/lib/prisma/client";

const monthStart = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export async function getFinancialAccountsByOrg(organizationId: string) {
  return prisma.financialAccount.findMany({
    where: { organizationId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function getRecentAccountTransactions(organizationId: string, take = 10) {
  return prisma.accountTransaction.findMany({
    where: { account: { organizationId } },
    include: { account: true },
    orderBy: { transactedAt: "desc" },
    take,
  });
}

export async function getIncomeRecordsByOrg(organizationId: string, take = 50) {
  return prisma.income.findMany({
    where: { organizationId },
    include: { account: true, department: true, event: true },
    orderBy: { receivedAt: "desc" },
    take,
  });
}

export async function getIncomeSummary(organizationId: string) {
  const start = monthStart();
  const records = await prisma.income.findMany({
    where: { organizationId, receivedAt: { gte: start } },
    select: { amount: true, category: true },
  });

  const total = records.reduce((sum: number, record: { amount: number }) => sum + record.amount, 0);
  const offerings = records
    .filter((record: { category: string }) => ["TITHE", "OFFERING"].includes(record.category))
    .reduce((sum: number, record: { amount: number }) => sum + record.amount, 0);
  const donations = records
    .filter((record: { category: string }) => record.category === "DONATION")
    .reduce((sum: number, record: { amount: number }) => sum + record.amount, 0);

  return { total, offerings, donations, other: total - offerings - donations };
}

export async function getIncomeMonthlyBreakdown(organizationId: string, year = new Date().getFullYear()) {
  const records = await prisma.income.findMany({
    where: {
      organizationId,
      receivedAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    select: { amount: true, category: true, receivedAt: true },
  });

  const months = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(year, index, 1).toLocaleString("en", { month: "short" }),
    offerings: 0,
    donations: 0,
    other: 0,
  }));

  for (const record of records) {
    const bucket = months[record.receivedAt.getMonth()];
    if (record.category === "TITHE" || record.category === "OFFERING") bucket.offerings += record.amount;
    else if (record.category === "DONATION") bucket.donations += record.amount;
    else bucket.other += record.amount;
  }

  return months;
}

export async function getExpenditureReportsByOrg(organizationId: string, take = 50) {
  return prisma.expenditureReport.findMany({
    where: { organizationId },
    include: { department: true, budget: true, receipts: true },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function getFinanceDashboard(organizationId: string) {
  const [accounts, income, expenditures, outstandingReports, pendingApprovals] =
    await Promise.all([
      prisma.financialAccount.findMany({ where: { organizationId } }),
      prisma.income.aggregate({ where: { organizationId }, _sum: { amount: true } }),
      prisma.expenditureReport.aggregate({
        where: { organizationId, status: { in: ["SUBMITTED", "APPROVED"] } },
        _sum: { totalClaimed: true, totalApproved: true },
      }),
      prisma.expenditureReport.count({ where: { organizationId, status: "DRAFT" } }),
      prisma.approval.count({
        where: { status: "PENDING", budget: { organizationId } },
      }),
    ]);

  const approvedBudget = await prisma.budget.findMany({
    where: { organizationId, status: "CHAIR_APPROVED" },
    include: { items: { select: { totalCost: true } } },
  });

  const approvedBudgetTotal = approvedBudget.reduce(
    (sum: number, budget: { items: Array<{ totalCost: number }> }) =>
      sum + budget.items.reduce((itemSum, item) => itemSum + item.totalCost, 0),
    0
  );
  const totalExpenditure = expenditures._sum.totalClaimed ?? 0;

  return {
    accounts,
    approvedBudget: approvedBudgetTotal,
    totalIncome: income._sum.amount ?? 0,
    totalExpenditure,
    expenditurePct: approvedBudgetTotal > 0 ? Math.round((totalExpenditure / approvedBudgetTotal) * 100) : 0,
    outstandingReports,
    accountabilityRate:
      outstandingReports + pendingApprovals > 0
        ? Math.round((pendingApprovals / (outstandingReports + pendingApprovals)) * 100)
        : 100,
  };
}

export async function getUpcomingEvents(organizationId: string, take = 4) {
  return prisma.event.findMany({
    where: { organizationId, startDate: { gte: new Date() } },
    include: {
      department: true,
      budgets: { include: { items: { select: { totalCost: true } } } },
    },
    orderBy: { startDate: "asc" },
    take,
  });
}

export async function getRecentAuditLogs(organizationId: string, take = 5) {
  return prisma.auditLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
