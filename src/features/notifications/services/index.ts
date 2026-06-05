import { prisma } from "@/lib/prisma/client";

export async function createNotification(data: {
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type?: "info" | "approval" | "warning" | "success";
  link?: string;
}) {
  return prisma.notification.create({ data });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllRead(userId: string, organizationId: string) {
  return prisma.notification.updateMany({
    where: { userId, organizationId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string, organizationId: string) {
  return prisma.notification.count({
    where: { userId, organizationId, read: false },
  });
}
