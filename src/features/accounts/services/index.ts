import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import type { CreateAccountInput } from "../schemas";

export async function createAccountService(
  input: CreateAccountInput,
  context: { userId: string; organizationId: string }
) {
  const { openingBalance, ...rest } = input;

  const account = await prisma.financialAccount.create({
    data: {
      ...rest,
      organizationId: context.organizationId,
      balance: openingBalance,
    },
  });

  if (openingBalance > 0) {
    await prisma.accountTransaction.create({
      data: {
        accountId: account.id,
        type: "credit",
        amount: openingBalance,
        description: "Opening balance",
        balanceAfter: openingBalance,
        recordedById: context.userId,
      },
    });
  }

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "FinancialAccount",
    entityId: account.id,
    action: "created",
    after: { name: account.name, type: account.type, openingBalance },
  });

  return account;
}