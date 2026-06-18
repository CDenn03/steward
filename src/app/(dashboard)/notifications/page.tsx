import { requireSession } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/features/finance/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { NotificationList } from "./notification-list";
import { MarkAllReadButton } from "./mark-all-read-button";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: Date;
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
        <MarkAllReadButton />
      </PageHeader>
      <Card>
        <NotificationList notifications={notifications} />
      </Card>
    </>
  );
}
