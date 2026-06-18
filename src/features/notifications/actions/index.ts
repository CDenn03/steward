"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  markNotificationRead,
  markAllRead,
  getUnreadCount,
  createNotification as createNotificationService,
} from "../services";

export async function getUnreadCountAction() {
  const session = await requireSession();
  return getUnreadCount(session.userId, session.organizationId);
}

export async function markNotificationReadAction(id: string) {
  const session = await requireSession();
  await markNotificationRead(id, session.userId);
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllReadAction() {
  const session = await requireSession();
  await markAllRead(session.userId, session.organizationId);
  revalidatePath("/notifications");
  return { success: true };
}