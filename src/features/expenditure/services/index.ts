import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import { createNotification } from "@/features/notifications/services";
import type {
  CreateExpenditureReportInput,
  UploadReceiptInput,
  AllocateReceiptInput,
} from "../schemas";

export async function createExpenditureReportService(
  input: CreateExpenditureReportInput,
  context: { userId: string; organizationId: string }
) {
  const budget = await prisma.budget.findFirst({
    where: { id: input.budgetId, organizationId: context.organizationId },
    select: { id: true, departmentId: true, title: true },
  });
  if (!budget) throw new Error("Budget not found");

  const report = await prisma.expenditureReport.create({
    data: {
      organizationId: context.organizationId,
      budgetId: input.budgetId,
      departmentId: budget.departmentId!,
      title: input.title,
      status: "DRAFT",
      totalClaimed: 0,
      notes: input.notes,
      submittedById: context.userId,
    },
    include: { budget: true, department: true },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "ExpenditureReport",
    entityId: report.id,
    action: "created",
    after: { title: report.title, budgetId: report.budgetId, status: "DRAFT" },
  });

  return report;
}

export async function saveReceiptService(
  input: UploadReceiptInput,
  context: { userId: string; organizationId: string }
) {
  const report = await prisma.expenditureReport.findFirst({
    where: { id: input.expenditureReportId, organizationId: context.organizationId },
  });
  if (!report) throw new Error("Expenditure report not found");

  const receipt = await prisma.receipt.create({
    data: {
      expenditureReportId: input.expenditureReportId,
      storageKey: input.storageKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      amount: input.amount,
      vendor: input.vendor,
      receiptDate: input.receiptDate,
      notes: input.notes,
      uploadedById: context.userId,
    },
  });

  await prisma.expenditureReport.update({
    where: { id: input.expenditureReportId },
    data: { totalClaimed: { increment: input.amount } },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Receipt",
    entityId: receipt.id,
    action: "uploaded",
    after: { fileName: input.fileName, amount: input.amount },
  });

  return receipt;
}

export async function allocateReceiptsService(
  input: AllocateReceiptInput,
  context: { userId: string; organizationId: string }
) {
  const receipt = await prisma.receipt.findFirst({
    where: { id: input.allocations[0]!.receiptId },
    include: { report: { select: { organizationId: true } } },
  });
  if (!receipt || receipt.report.organizationId !== context.organizationId) {
    throw new Error("Receipt not found");
  }

  const existing = await prisma.receiptAllocation.findMany({
    where: { receiptId: receipt.id },
  });
  if (existing.length > 0) {
    await prisma.receiptAllocation.deleteMany({
      where: { receiptId: receipt.id },
    });
  }

  const totalAllocated = input.allocations.reduce((sum, a) => sum + a.amount, 0);
  if (Math.abs(totalAllocated - receipt.amount) > 0.01) {
    throw new Error(
      `Total allocated (${totalAllocated}) must equal receipt amount (${receipt.amount})`
    );
  }

  const allocations = await prisma.$transaction(
    input.allocations.map((allocation) =>
      prisma.receiptAllocation.create({
        data: {
          receiptId: allocation.receiptId,
          budgetItemId: allocation.budgetItemId,
          amount: allocation.amount,
        },
      })
    )
  );

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "ReceiptAllocation",
    entityId: receipt.id,
    action: "allocated",
    after: { allocations: input.allocations },
  });

  return allocations;
}

export async function submitExpenditureReportService(
  expenditureReportId: string,
  context: { userId: string; organizationId: string }
) {
  const report = await prisma.expenditureReport.findFirst({
    where: { id: expenditureReportId, organizationId: context.organizationId },
    include: { receipts: true },
  });
  if (!report) throw new Error("Expenditure report not found");
  if (report.status !== "DRAFT") {
    throw new Error(`Cannot submit a report with status: ${report.status}`);
  }
  if (report.receipts.length === 0) {
    throw new Error("At least one receipt is required before submitting");
  }

  const updated = await prisma.expenditureReport.update({
    where: { id: expenditureReportId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "ExpenditureReport",
    entityId: expenditureReportId,
    action: "submitted",
    before: { status: "DRAFT" },
    after: { status: "SUBMITTED" },
  });

  await createNotification({
    organizationId: context.organizationId,
    userId: context.userId,
    title: "Expenditure report submitted",
    message: `${report.title} has been submitted for review (${report.receipts.length} receipts)`,
    type: "approval",
    link: `/expenditures/${expenditureReportId}`,
  });

  return updated;
}
