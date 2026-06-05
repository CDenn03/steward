"use client";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  approval: "✅",
  warning: "⚠️",
  info: "ℹ️",
  success: "🎉",
};

export default function NotificationsPage() {
  const unread = mockNotifications.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}>
        <Button variant="ghost" size="sm"><CheckCheck size={13} /> Mark all read</Button>
      </PageHeader>
      <Card>
        <div className="divide-y divide-[var(--border)]">
          {mockNotifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-[var(--bg)]",
                !n.read && "bg-[var(--primary-light)]"
              )}
            >
              <div className="text-xl flex-shrink-0 mt-0.5">{typeIcons[n.type] ?? "🔔"}</div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px]", !n.read ? "font-semibold" : "font-medium")}>{n.title}</p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">{n.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-[var(--muted)]">{formatRelative(n.createdAt)}</span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
