import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import { createNotification } from "@/features/notifications/services";
import type { CreateDisbursementInput } from "../schemas";

export async function createDisbursementService(
  input: CreateDisbursementInput,
  context: { userId: string; organizationId: string }
) {
  const budget = await prisma.budget.findFirst({
    where: { id: input.budgetId, organizationId: context.organizationId },
    select: { id: true, title: true, organizationId: true },
  });
  if (!budget) throw new Error("Budget not found");

  const account = await prisma.financialAccount.findFirst({
    where: { id: input.accountId, organizationId: context.organizationId },
  });
  if (!account) throw new Error("Account not found");

  const disbursement = await prisma.disbursement.create({
    data: {
      organizationId: context.organizationId,
      budgetId: input.budgetId,
      accountId: input.accountId,
      description: input.description,
      totalAmount: input.totalAmount,
      status: "PENDING",
      requestedById: context.userId,
      notes: input.notes,
      items: {
        create: input.items.map((item) => ({
          description: item.description,
          amount: item.amount,
          budgetItemId: item.budgetItemId,
        })),
      },
    },
    include: { items: true, account: true },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Disbursement",
    entityId: disbursement.id,
    action: "requested",
    after: {
      description: input.description,
      totalAmount: input.totalAmount,
      status: "PENDING",
    },
  });

  await createNotification({
    organizationId: context.organizationId,
    userId: context.userId,
    title: "Disbursement requested",
    message: `${input.description} (${input.totalAmount}) has been requested from ${budget.title}`,
    type: "approval",
    link: `/budgets/${input.budgetId}`,
  });

  return disbursement;
}

export async function releaseDisbursementService(
  disbursementId: string,
  context: { userId: string; organizationId: string }
) {
  const disbursement = await prisma.disbursement.findFirst({
    where: { id: disbursementId, organizationId: context.organizationId },
    include: { account: true },
  });
  if (!disbursement) throw new Error("Disbursement not found");
  if (disbursement.status !== "PENDING" && disbursement.status !== "APPROVED") {
    throw new Error(`Cannot release disbursement with status: ${disbursement.status}`);
  }

  const account = await prisma.financialAccount.findFirst({
    where: { id: disbursement.accountId, organizationId: context.organizationId },
  });
  if (!account) throw new Error("Account not found");
  if (account.balance < disbursement.totalAmount) {
    throw new Error(
      `Insufficient balance in ${account.name}. Available: ${account.balance}, Required: ${disbursement.totalAmount}`
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.disbursement.update({
      where: { id: disbursementId },
      data: {
        status: "RELEASED",
        approvedById: context.userId,
        releasedAt: new Date(),
      },
    }),
    prisma.financialAccount.update({
      where: { id: disbursement.accountId },
      data: { balance: { decrement: disbursement.totalAmount } },
    }),
    prisma.accountTransaction.create({
      data: {
        accountId: disbursement.accountId,
        type: "disbursement",
        amount: disbursement.totalAmount,
        description: `Disbursement: ${disbursement.description}`,
        reference: disbursementId,
        balanceAfter: account.balance - disbursement.totalAmount,
        recordedById: context.userId,
      },
    }),
  ]);

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Disbursement",
    entityId: disbursementId,
    action: "released",
    before: { status: disbursement.status },
    after: { status: "RELEASED", amount: disbursement.totalAmount },
  });

  await createNotification({
    organizationId: context.organizationId,
    userId: context.userId,
    title: "Disbursement released",
    message: `${disbursement.description} (${disbursement.totalAmount}) has been released`,
    type: "success",
    link: `/budgets/${disbursement.budgetId}`,
  });

  return updated;
}

export async function getPendingDisbursements(organizationId: string) {
  return prisma.disbursement.findMany({
    where: { organizationId, status: "PENDING" },
    include: {
      budget: { select: { id: true, title: true, departmentId: true, department: { select: { name: true } } } },
      account: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAccountsForDisbursement(organizationId: string) {
  return prisma.financialAccount.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true, type: true, balance: true, currency: true },
    orderBy: { name: "asc" },
  });
}