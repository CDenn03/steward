import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import { createNotification } from "@/features/notifications/services";
import { updateBudget } from "../repositories";
import type { CreateBudgetInput, ReviewBudgetInput } from "../schemas";

export async function createBudgetService(
  input: CreateBudgetInput,
  context: { userId: string; organizationId: string }
) {
  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  const budget = await prisma.budget.create({
    data: {
      organizationId: context.organizationId,
      departmentId: input.departmentId,
      eventId: input.eventId,
      title: input.title,
      description: input.description,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      status: "DRAFT",
      submittedById: context.userId,
      items: {
        create: input.items.map((item) => ({
          categoryId: item.categoryId,
          description: item.description,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          notes: item.notes,
        })),
      },
    },
    include: { items: true, department: true },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Budget",
    entityId: budget.id,
    action: "created",
    after: { title: budget.title, totalAmount, status: "DRAFT" },
  });

  return budget;
}

export async function submitBudgetService(
  budgetId: string,
  context: { userId: string; organizationId: string }
) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, organizationId: context.organizationId },
    include: { department: true },
  });

  if (!budget) throw new Error("Budget not found");
  if (budget.status !== "DRAFT" && budget.status !== "NEEDS_CHANGES") {
    throw new Error(`Cannot submit a budget with status: ${budget.status}`);
  }

  const [updated] = await prisma.$transaction([
    prisma.budget.update({
      where: { id: budgetId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        submittedById: context.userId,
      },
    }),
    prisma.approval.upsert({
      where: { id: `approval-finance-${budgetId}` },
      update: { status: "PENDING" },
      create: {
        id: `approval-finance-${budgetId}`,
        budgetId,
        type: "FINANCE",
        status: "PENDING",
      },
    }),
  ]);

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Budget",
    entityId: budgetId,
    action: "submitted",
    before: { status: budget.status },
    after: { status: "SUBMITTED" },
  });

  // Notify finance officers
  await createNotification({
    organizationId: context.organizationId,
    userId: context.userId, // Would normally be all finance officer IDs
    title: "Budget submitted for review",
    message: `${budget.title} has been submitted for finance review`,
    type: "approval",
    link: `/budgets/${budgetId}`,
  });

  return updated;
}

export async function reviewBudgetService(
  input: ReviewBudgetInput,
  context: { userId: string; organizationId: string }
) {
  const budget = await prisma.budget.findFirst({
    where: { id: input.budgetId, organizationId: context.organizationId },
  });
  if (!budget) throw new Error("Budget not found");

  const statusMap = {
    approved: input.approvalType === "finance" ? "FINANCE_APPROVED" : "CHAIR_APPROVED",
    rejected: "REJECTED",
    needs_changes: "NEEDS_CHANGES",
  } as const;

  const newStatus = statusMap[input.decision];

  await prisma.$transaction([
    prisma.budget.update({
      where: { id: input.budgetId },
      data: { status: newStatus },
    }),
    prisma.approval.updateMany({
      where: {
        budgetId: input.budgetId,
        type: input.approvalType === "finance" ? "FINANCE" : "CHAIRPERSON",
        status: "PENDING",
      },
      data: {
        status: input.decision === "approved" ? "APPROVED" : input.decision === "rejected" ? "REJECTED" : "NEEDS_CHANGES",
        reviewerId: context.userId,
        comment: input.comment,
        reviewedAt: new Date(),
      },
    }),
  ]);

  // If finance approved, create chairperson approval
  if (input.decision === "approved" && input.approvalType === "finance") {
    await prisma.approval.create({
      data: {
        budgetId: input.budgetId,
        type: "CHAIRPERSON",
        status: "PENDING",
      },
    });
  }

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Budget",
    entityId: input.budgetId,
    action: input.decision,
    before: { status: budget.status },
    after: { status: newStatus, comment: input.comment },
  });
}

export async function updateBudgetService(
  budgetId: string,
  input: {
    title?: string;
    description?: string;
    departmentId?: string;
    eventId?: string;
    periodStart?: Date;
    periodEnd?: Date;
    items?: Array<{
      id?: string;
      categoryId?: string;
      description: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      notes?: string;
    }>;
  },
  context: { userId: string; organizationId: string }
) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, organizationId: context.organizationId },
  });
  if (!budget) throw new Error("Budget not found");
  if (budget.status !== "DRAFT" && budget.status !== "NEEDS_CHANGES") {
    throw new Error("Only draft or needs-changes budgets can be edited");
  }

  const updated = await updateBudget(budgetId, input);

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Budget",
    entityId: budgetId,
    action: "updated",
    before: { title: budget.title, status: budget.status },
    after: { title: updated.title, status: updated.status },
  });

  return updated;
}
