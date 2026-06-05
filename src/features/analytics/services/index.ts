/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma/client";
import { unstable_cache } from "next/cache";

export const getDashboardStats = unstable_cache(
  async (organizationId: string) => {
    const [approvedCount, incomeAgg, expenditureAgg, outstandingReports] = await Promise.all([
      prisma.budget.count({ where: { organizationId, status: "CHAIR_APPROVED" } }),
      prisma.income.aggregate({ where: { organizationId }, _sum: { amount: true } }),
      prisma.expenditureReport.aggregate({
        where: { organizationId, status: { in: ["SUBMITTED", "APPROVED"] } },
        _sum: { totalClaimed: true },
      }),
      prisma.expenditureReport.count({ where: { organizationId, status: "DRAFT" } }),
    ]);
    return {
      approvedBudgetCount: approvedCount,
      totalIncome: incomeAgg._sum.amount ?? 0,
      totalExpenditure: expenditureAgg._sum.totalClaimed ?? 0,
      outstandingReports,
    };
  },
  ["dashboard-stats"],
  { revalidate: 300 }
);

export const getDepartmentSpend = unstable_cache(
  async (organizationId: string) => {
    const departments = await prisma.department.findMany({
      where: { organizationId, isActive: true },
      include: {
        budgets: {
          include: {
            items: { select: { totalCost: true } },
            expenditures: {
              where: { status: { in: ["SUBMITTED", "APPROVED"] } },
              select: { totalClaimed: true },
            },
          },
        },
      },
    });

    return departments.map((dept: any) => {
      const allocated = (dept.budgets as any[]).reduce(
        (sum: number, b: any) => sum + (b.items as any[]).reduce((s: number, i: any) => s + (i.totalCost as number), 0),
        0
      );
      const spent = (dept.budgets as any[]).reduce(
        (sum: number, b: any) => sum + (b.expenditures as any[]).reduce((s: number, e: any) => s + (e.totalClaimed as number), 0),
        0
      );
      return {
        departmentId: dept.id as string,
        departmentName: dept.name as string,
        allocated,
        spent,
        variance: allocated - spent,
        utilisation: allocated > 0 ? Math.round((spent / allocated) * 100) : 0,
      };
    });
  },
  ["department-spend"],
  { revalidate: 300 }
);

export const getBudgetVariance = unstable_cache(
  async (organizationId: string) => {
    const budgets = await prisma.budget.findMany({
      where: { organizationId, status: { in: ["FINANCE_APPROVED", "CHAIR_APPROVED"] } },
      include: {
        items: { select: { totalCost: true } },
        expenditures: {
          where: { status: { in: ["SUBMITTED", "APPROVED"] } },
          select: { totalClaimed: true },
        },
        department: { select: { name: true } },
        event: { select: { name: true } },
      },
    });

    return budgets.map((budget: any) => {
      const allocated = budget.items.reduce((s: number, i: any) => s + i.totalCost, 0);
      const spent = budget.expenditures.reduce((s: number, e: any) => s + e.totalClaimed, 0);
      return {
        budgetId: budget.id,
        title: budget.title,
        department: budget.department?.name,
        allocated,
        spent,
        variance: allocated - spent,
        variancePct: allocated > 0 ? Math.round(((allocated - spent) / allocated) * 100) : 0,
      };
    });
  },
  ["budget-variance"],
  { revalidate: 300 }
);

export const getIncomeByMonth = unstable_cache(
  async (organizationId: string, year: number) => {
    const records = await prisma.income.findMany({
      where: {
        organizationId,
        receivedAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
      },
      select: { amount: true, category: true, receivedAt: true },
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(year, i).toLocaleString("en", { month: "short" }),
      total: 0, offering: 0, donation: 0, registration: 0, other: 0,
    }));

    for (const r of records) {
      const idx = r.receivedAt.getMonth();
      months[idx].total += r.amount;
      const cat = r.category.toLowerCase();
      if (cat === "offering" || cat === "tithe") months[idx].offering += r.amount;
      else if (cat === "donation") months[idx].donation += r.amount;
      else if (cat === "registration") months[idx].registration += r.amount;
      else months[idx].other += r.amount;
    }
    return months;
  },
  ["income-by-month"],
  { revalidate: 300 }
);
