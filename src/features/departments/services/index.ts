import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import type { CreateDepartmentInput, SetDepartmentAllocationInput } from "../schemas";

export async function getDepartmentAllocations(organizationId: string, fiscalYear?: number) {
  const year = fiscalYear ?? new Date().getFullYear();
  return prisma.departmentAllocation.findMany({
    where: { department: { organizationId }, fiscalYear: year },
    include: { department: { select: { id: true, name: true, softLimit: true } } },
  });
}

export async function createDepartmentService(
  input: CreateDepartmentInput,
  context: { userId: string; organizationId: string }
) {
  const department = await prisma.department.create({
    data: {
      ...input,
      organizationId: context.organizationId,
    },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Department",
    entityId: department.id,
    action: "created",
    after: { name: department.name, softLimit: department.softLimit },
  });

  return department;
}

export async function updateDepartmentService(
  id: string,
  input: Partial<CreateDepartmentInput & { isActive: boolean }>,
  context: { userId: string; organizationId: string }
) {
  const department = await prisma.department.findFirst({
    where: { id, organizationId: context.organizationId },
  });
  if (!department) throw new Error("Department not found");

  const updated = await prisma.department.update({
    where: { id },
    data: input,
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Department",
    entityId: id,
    action: "updated",
    before: { name: department.name },
    after: { name: updated.name, softLimit: updated.softLimit, isActive: updated.isActive },
  });

  return updated;
}

export async function setDepartmentAllocationService(
  input: SetDepartmentAllocationInput,
  context: { userId: string; organizationId: string }
) {
  const department = await prisma.department.findFirst({
    where: { id: input.departmentId, organizationId: context.organizationId },
  });
  if (!department) throw new Error("Department not found");

  const allocation = await prisma.departmentAllocation.upsert({
    where: {
      departmentId_fiscalYear: {
        departmentId: input.departmentId,
        fiscalYear: input.fiscalYear,
      },
    },
    update: { amount: input.amount },
    create: {
      departmentId: input.departmentId,
      fiscalYear: input.fiscalYear,
      amount: input.amount,
    },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "DepartmentAllocation",
    entityId: allocation.id,
    action: input.amount > 0 ? "allocated" : "updated",
    after: { departmentId: input.departmentId, fiscalYear: input.fiscalYear, amount: input.amount },
  });

  return allocation;
}