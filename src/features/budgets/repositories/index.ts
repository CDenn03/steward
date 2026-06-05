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
  return prisma.budget.findFirst({
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
  });
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
      budget: { include: { department: true, event: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
