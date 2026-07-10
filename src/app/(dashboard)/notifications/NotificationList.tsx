"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { formatRelative, cn } from "@/lib/utils";
import { markNotificationReadAction } from "@/features/notifications/actions";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: Date;
};

const typeStyles: Record<string, string> = {
  approval: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  info: "bg-[var(--primary-light)] text-(--primary)",
  success: "bg-success-bg text-success",
};

export function NotificationList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();

  const handleClick = async (n: NotificationRow) => {
    if (!n.read) {
      await markNotificationReadAction(n.id);
      router.refresh();
    }
    if (n.link) router.push(n.link);
  };

  return (
    <div className="divide-y divide-(--border)">
      {notifications.length === 0 ? (
        <div className="px-5 py-12 text-center text-[14px] text-(--muted)">No notifications</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={cn(
              "flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-(--bg)",
              !n.read && "bg-[var(--primary-light)]"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5",
              typeStyles[n.type] ?? typeStyles.info
            )}>
              <Bell size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-[14px]", !n.read ? "font-semibold" : "font-medium")}>{n.title}</p>
              <p className="text-[13px] text-(--muted) mt-0.5">{n.message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] text-(--muted)">{formatRelative(n.createdAt)}</span>
              {!n.read && <span className="w-2 h-2 rounded-full bg-(--primary)" />}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
