"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { mockAuditLogs } from "@/lib/mock/data";
import type { AuditLog } from "@/types";

const actionVariants: Record<string, "default"|"success"|"warning"|"danger"|"info"> = {
  submitted: "info",
  approved: "success",
  uploaded: "default",
  needs_changes: "warning",
  recorded: "success",
  rejected: "danger",
};

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit Log" subtitle="Immutable record of all financial actions and state changes" />
      <Card>
        <DataTable
          columns={[
            {
              key: "actor",
              header: "Actor",
              render: (l: AuditLog) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)]">
                    {l.actor?.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">{l.actor?.name}</p>
                    <p className="text-[11px] text-[var(--muted)] capitalize">{l.actor?.role.replace("_", " ")}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "entity",
              header: "Entity",
              render: (l: AuditLog) => (
                <div>
                  <p className="text-[13px]">{l.entityType}</p>
                  <p className="text-[11px] text-[var(--muted)] font-mono">{l.entityId}</p>
                </div>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (l: AuditLog) => (
                <Badge variant={actionVariants[l.action] ?? "default"} className="capitalize">
                  {l.action.replace("_", " ")}
                </Badge>
              ),
            },
            {
              key: "detail",
              header: "Detail",
              render: (l: AuditLog) => (
                <span className="text-[12px] text-[var(--muted)] font-mono">
                  {l.after ? JSON.stringify(l.after) : "—"}
                </span>
              ),
            },
            {
              key: "time",
              header: "Time",
              render: (l: AuditLog) => (
                <span className="text-[var(--muted)]">{formatRelative(l.createdAt)}</span>
              ),
            },
          ]}
          data={mockAuditLogs}
        />
      </Card>
    </>
  );
}
