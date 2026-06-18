import { prisma } from "@/lib/prisma/client";
import type { RecordIncomeInput } from "../schemas";

export async function recordIncomeService(
  input: RecordIncomeInput,
  context: { userId: string; organizationId: string }
) {
  const income = await prisma.$transaction(async (tx: typeof prisma) => {
    const account = await tx.financialAccount.findFirst({
      where: { id: input.accountId, organizationId: context.organizationId },
      select: { id: true, balance: true },
    });
    if (!account) throw new Error("Account not found");

    const createdIncome = await tx.income.create({
      data: {
        ...input,
        organizationId: context.organizationId,
        recordedById: context.userId,
      },
    });

    const balanceAfter = account.balance + input.amount;
    await tx.financialAccount.update({
      where: { id: input.accountId },
      data: { balance: balanceAfter },
    });

    await tx.accountTransaction.create({
      data: {
        accountId: input.accountId,
        type: "credit",
        amount: input.amount,
        description: input.description,
        reference: createdIncome.id,
        balanceAfter,
        recordedById: context.userId,
        transactedAt: input.receivedAt,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: context.organizationId,
        actorId: context.userId,
        entityType: "Income",
        entityId: createdIncome.id,
        action: "recorded",
        after: { amount: createdIncome.amount, category: createdIncome.category },
      },
    });

    return createdIncome;
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
