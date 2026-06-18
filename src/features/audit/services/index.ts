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
  filters?: {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }
) {
  return prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(filters?.entityType ? { entityType: filters.entityType } : {}),
      ...(filters?.entityId ? { entityId: filters.entityId } : {}),
      ...(filters?.actorId ? { actorId: filters.actorId } : {}),
      ...(filters?.action ? { action: filters.action } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 100,
    include: { organization: false },
  });
}

export async function getAuditFilterOptions(organizationId: string) {
  const [entityTypes, actors] = await Promise.all([
    prisma.auditLog.findMany({
      where: { organizationId },
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { organizationId },
      distinct: ["actorId"],
      select: { actorId: true },
    }),
  ]);

  const actorIds = actors.map((a: { actorId: string }) => a.actorId);
  const users = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true },
  });
  const usersById = new Map<string, { id: string; name: string }>(
    users.map((u: { id: string; name: string }) => [u.id, u])
  );

  return {
    entityTypes: entityTypes.map((e: { entityType: string }) => e.entityType),
    actors: actorIds.map((id: string) => ({
      id,
      name: usersById.get(id)?.name ?? "Unknown",
    })),
  };
}
