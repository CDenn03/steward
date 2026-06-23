"use client";

import { DataTable, createColumnHelper } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";

const actionVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  submitted: "info",
  approved: "success",
  uploaded: "default",
  needs_changes: "warning",
  recorded: "success",
  rejected: "danger",
  created: "info",
};

export type AuditRow = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  after?: unknown;
  createdAt: Date;
  actor?: { name?: string; role?: string };
};

const helper = createColumnHelper<AuditRow>();

const columns = [
  helper.display({
    id: "actor",
    header: "Actor",
    cell: (info) => {
      const actor = info.row.original.actor;
      const name = actor?.name ?? "Unknown user";
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-(--primary)">
            {name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-[13px] font-medium">{name}</p>
            <p className="text-[11px] text-(--muted) capitalize">{(actor?.role ?? "member").replace("_", " ")}</p>
          </div>
        </div>
      );
    },
  }),
  helper.display({
    id: "entity",
    header: "Entity",
    cell: (info) => (
      <div>
        <p className="text-[13px]">{info.row.original.entityType}</p>
        <p className="text-[11px] text-(--muted) font-mono">{info.row.original.entityId}</p>
      </div>
    ),
  }),
  helper.accessor("action", {
    header: "Action",
    cell: (info) => (
      <Badge variant={actionVariants[info.getValue()] ?? "default"} className="capitalize">
        {info.getValue().replace("_", " ")}
      </Badge>
    ),
  }),
  helper.display({
    id: "detail",
    header: "Detail",
    cell: (info) => (
      <span className="text-[12px] text-(--muted) font-mono">
        {info.row.original.after ? JSON.stringify(info.row.original.after) : "-"}
      </span>
    ),
  }),
  helper.accessor("createdAt", {
    header: "Time",
    cell: (info) => (
      <span className="text-(--muted)">{formatRelative(info.getValue())}</span>
    ),
  }),
];

export function AuditTable({ data }: { data: AuditRow[] }) {
  return <DataTable columns={columns} data={data} pageSize={25} />;
}
