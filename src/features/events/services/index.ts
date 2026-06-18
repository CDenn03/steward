import { prisma } from "@/lib/prisma/client";
import { createAuditLog } from "@/features/audit/services";
import type { CreateEventInput } from "../schemas";

export async function createEventService(
  input: CreateEventInput,
  context: { userId: string; organizationId: string }
) {
  const event = await prisma.event.create({
    data: {
      ...input,
      organizationId: context.organizationId,
    },
    include: { department: true },
  });

  await createAuditLog({
    organizationId: context.organizationId,
    actorId: context.userId,
    entityType: "Event",
    entityId: event.id,
    action: "created",
    after: { name: event.name, status: event.status, startDate: event.startDate },
  });

  return event;
}