"use client";

import { DataTable, createColumnHelper, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelative } from "@/lib/utils";

export type ReportRow = {
  id: string;
  department: { name: string } | null;
  status: "draft" | "submitted" | "approved" | "rejected";
  totalClaimed: number;
  totalApproved: number | null;
  submittedAt: Date | null;
};

const helper = createColumnHelper<ReportRow>();

const columns = [
  helper.display({
    id: "dept",
    header: "Department",
    cell: ({ row }) => <span className="font-medium">{row.original.department?.name ?? "General"}</span>,
  }),
  helper.accessor("totalClaimed", {
    header: "Total Claimed",
    cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.totalClaimed)}</span>,
  }),
  helper.accessor("status", {
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  helper.accessor("submittedAt", {
    header: "Submitted",
    cell: ({ row }) => {
      const val = row.original.submittedAt;
      return <span className="text-(--muted)">{val ? formatRelative(val) : "-"}</span>;
    },
  }),
  helper.display({
    id: "actions",
    header: "",
    cell: () => <Button variant="ghost" size="sm">Review</Button>,
  }),
] as ColumnDef<ReportRow>[];

export function ExpendituresTable({ data }: { data: ReportRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
