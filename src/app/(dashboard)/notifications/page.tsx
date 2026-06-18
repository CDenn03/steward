import { Bell, CheckCheck } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/features/finance/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
};

const typeStyles: Record<string, string> = {
  approval: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  info: "bg-[var(--primary-light)] text-(--primary)",
  success: "bg-success-bg text-success",
};

export default async function NotificationsPage() {
  const session = await requireSession();
  const notifications = await getNotificationsForUser(
    session.organizationId,
    session.userId
  ) as NotificationRow[];
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}>
        <Button variant="ghost" size="sm"><CheckCheck size={13} /> Mark all read</Button>
      </PageHeader>
      <Card>
        <div className="divide-y divide-(--border)">
          {notifications.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-(--muted)">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-(--bg)",
                  !notification.read && "bg-[var(--primary-light)]"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5",
                  typeStyles[notification.type] ?? typeStyles.info
                )}>
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[13px]", !notification.read ? "font-semibold" : "font-medium")}>{notification.title}</p>
                  <p className="text-[12px] text-(--muted) mt-0.5">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-(--muted)">{formatRelative(notification.createdAt)}</span>
                  {!notification.read && <span className="w-2 h-2 rounded-full bg-(--primary)" />}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}
