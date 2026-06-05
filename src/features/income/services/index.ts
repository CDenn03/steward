import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import type { RecordIncomeInput } from "../schemas";

export async function recordIncomeService(
  input: RecordIncomeInput,
  context: { userId: string; organizationId: string }
) {
  const income = await prisma.income.create({
    data: {
      ...input,
      organizationId: context.organizationId,
      recordedById: context.userId,
    },
  });

  // Update account balance
  await prisma.$transaction([
    prisma.financialAccount.update({
      where: { id: input.accountId },
      data: { balance: { increment: input.amount } },
    }),
    prisma.accountTransaction.create({
      data: {
        accountId: input.accountId,
        type: "credit",
        amount: input.amount,
        description: input.description,
        balanceAfter: 0, // Would be computed in real impl
        recordedById: context.userId,
      },
    }),
  ]);

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Income",
    entityId: income.id,
    action: "recorded",
    after: { amount: income.amount, category: income.category },
  });

  return income;
}

export async function getIncomeByOrg(
  organizationId: string,
  filters?: { accountId?: string; category?: string; from?: Date; to?: Date }
) {
  return prisma.income.findMany({
    where: {
      organizationId,
      ...(filters?.accountId ? { accountId: filters.accountId } : {}),
      ...(filters?.category ? { category: filters.category as string } : {}),
      ...(filters?.from || filters?.to
        ? { receivedAt: { gte: filters.from, lte: filters.to } }
        : {}),
    },
    include: { account: true, department: true, event: true },
    orderBy: { receivedAt: "desc" },
  });
}
