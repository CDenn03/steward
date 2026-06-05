import { prisma } from "@/lib/prisma/client";

export async function createAuditLog(data: {
  organizationId: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data });
}

export async function getAuditLogs(
  organizationId: string,
  filters?: { entityType?: string; entityId?: string; actorId?: string; limit?: number }
) {
  return prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(filters?.entityType ? { entityType: filters.entityType } : {}),
      ...(filters?.entityId ? { entityId: filters.entityId } : {}),
      ...(filters?.actorId ? { actorId: filters.actorId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 50,
  });
}
