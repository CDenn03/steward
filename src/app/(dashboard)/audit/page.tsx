import { requireSession } from "@/lib/auth/session";
import { getAuditLogsByOrg } from "@/features/finance/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";

const actionVariants: Record<string, "default"|"success"|"warning"|"danger"|"info"> = {
  submitted: "info",
  approved: "success",
  uploaded: "default",
  needs_changes: "warning",
  recorded: "success",
  rejected: "danger",
  created: "info",
};

type AuditRow = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  after?: unknown;
  createdAt: Date;
  actor?: {
    name?: string;
    role?: string;
  };
};

export default async function AuditPage() {
  const session = await requireSession();
  const logs = await getAuditLogsByOrg(session.organizationId) as AuditRow[];

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Immutable record of all financial actions and state changes" />
      <Card>
        <DataTable
          columns={[
            {
              key: "actor",
              header: "Actor",
              render: (log: AuditRow) => {
                const name = log.actor?.name ?? "Unknown user";
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)]">
                      {name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{name}</p>
                      <p className="text-[11px] text-[var(--muted)] capitalize">{(log.actor?.role ?? "member").replace("_", " ")}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              key: "entity",
              header: "Entity",
              render: (log: AuditRow) => (
                <div>
                  <p className="text-[13px]">{log.entityType}</p>
                  <p className="text-[11px] text-[var(--muted)] font-mono">{log.entityId}</p>
                </div>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (log: AuditRow) => (
                <Badge variant={actionVariants[log.action] ?? "default"} className="capitalize">
                  {log.action.replace("_", " ")}
                </Badge>
              ),
            },
            {
              key: "detail",
              header: "Detail",
              render: (log: AuditRow) => (
                <span className="text-[12px] text-[var(--muted)] font-mono">
                  {log.after ? JSON.stringify(log.after) : "-"}
                </span>
              ),
            },
            {
              key: "time",
              header: "Time",
              render: (log: AuditRow) => (
                <span className="text-[var(--muted)]">{formatRelative(log.createdAt)}</span>
              ),
            },
          ]}
          data={logs}
        />
      </Card>
    </>
  );
}
