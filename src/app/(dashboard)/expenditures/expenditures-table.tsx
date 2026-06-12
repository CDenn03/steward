"use client";

import { DataTable } from "@/components/shared/data-table";
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

const columns = [
  { key: "dept", header: "Department", render: (r: ReportRow) => <span className="font-medium">{r.department?.name ?? "General"}</span> },
  { key: "claimed", header: "Total Claimed", render: (r: ReportRow) => <span className="font-mono">{formatCurrency(r.totalClaimed)}</span> },
  { key: "status", header: "Status", render: (r: ReportRow) => <StatusBadge status={r.status} /> },
  { key: "submitted", header: "Submitted", render: (r: ReportRow) => <span className="text-[var(--muted)]">{r.submittedAt ? formatRelative(r.submittedAt) : "-"}</span> },
  { key: "actions", header: "", render: () => <Button variant="ghost" size="sm">Review</Button> },
];

export function ExpendituresTable({ data }: { data: ReportRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
