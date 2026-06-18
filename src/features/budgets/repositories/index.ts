import { prisma } from "@/lib/prisma/client";

export async function getBudgetsByOrg(
  organizationId: string,
  filters?: { status?: string; departmentId?: string }
) {
  return prisma.budget.findMany({
    where: {
      organizationId,
      ...(filters?.status ? { status: filters.status as never } : {}),
      ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
    },
    include: {
      department: true,
      event: true,
      items: { include: { category: true } },
      approvals: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getBudgetById(id: string, organizationId: string) {
  const [budget, attachments] = await Promise.all([
    prisma.budget.findFirst({
    where: { id, organizationId },
    include: {
      department: true,
      event: true,
      items: {
        include: { category: true },
        orderBy: { category: { name: "asc" } },
      },
      approvals: {
        include: { comments: true },
        orderBy: { createdAt: "desc" },
      },
      disbursements: { orderBy: { createdAt: "desc" } },
      expenditures: {
        include: { department: true, receipts: true },
        orderBy: { createdAt: "desc" },
      },
    },
    }),
    prisma.attachment.findMany({
      where: { entityType: "Budget", entityId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return budget ? { ...budget, attachments } : null;
}

export async function createBudget(data: {
  organizationId: string;
  title: string;
  description?: string;
  departmentId?: string;
  eventId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  submittedById: string;
  items: Array<{
    categoryId?: string;
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    notes?: string;
  }>;
}) {
  const { items, ...budgetData } = data;
  return prisma.budget.create({
    data: {
      ...budgetData,
      items: { create: items },
    },
    include: { items: true, department: true },
  });
}

export async function updateBudgetStatus(
  id: string,
  organizationId: string,
  status: string
) {
  return prisma.budget.update({
    where: { id },
    data: { status: status as never, updatedAt: new Date() },
  });
}

export async function getPendingApprovals(organizationId: string) {
  return prisma.approval.findMany({
    where: {
      status: "PENDING",
      budget: { organizationId },
    },
    include: {
      budget: { include: { department: true, event: true, items: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDashboardBudgets(organizationId: string) {
  return prisma.budget.findMany({
    where: { organizationId },
    include: {
      department: true,
      event: true,
      items: { select: { totalCost: true } },
      expenditures: { select: { totalClaimed: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
}

export async function getBudgetFormOptions(organizationId: string) {
  const [departments, events, categories] = await Promise.all([
    prisma.department.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { organizationId },
      select: { id: true, name: true, startDate: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.budgetCategory.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { departments, events, categories };
}

export async function getDepartmentBudgetSummaries(organizationId: string) {
  return prisma.department.findMany({
    where: { organizationId, isActive: true },
    include: {
      budgets: {
        include: {
          items: { select: { totalCost: true } },
          expenditures: { select: { totalClaimed: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getEventsWithBudgets(organizationId: string) {
  return prisma.event.findMany({
    where: { organizationId },
    include: {
      department: true,
      budgets: {
        include: { items: { select: { totalCost: true } } },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getBudgetAnalytics(organizationId: string) {
  return prisma.department.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      name: true,
      budgets: {
        select: {
          items: { select: { totalCost: true } },
          expenditures: { select: { totalClaimed: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}
