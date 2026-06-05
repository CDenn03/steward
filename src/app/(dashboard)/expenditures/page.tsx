"use client";
import { Plus, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { mockExpenditureReports } from "@/lib/mock/data";
import type { ExpenditureReport } from "@/types";

export default function ExpendituresPage() {
  return (
    <>
      <PageHeader title="Expenditures" subtitle="Expenditure reports and receipt accountability">
        <Button variant="ghost" size="sm"><Upload size={13} /> Upload Receipts</Button>
        <Button size="sm"><Plus size={13} /> New Report</Button>
      </PageHeader>
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Total Claimed" value="KES 1.42M" delta={76} deltaLabel="of approved budget" />
        <StatCard label="Approved" value="KES 1.24M" accentColor="success" />
        <StatCard label="Pending Review" value={String(mockExpenditureReports.length)} accentColor="warning" />
        <StatCard label="Outstanding" value="7" accentColor="warning" progress={64} progressLabel="64% submitted" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle><p className="text-[14px] font-medium">Expenditure Reports</p></CardTitle>
        </CardHeader>
        <DataTable
          columns={[
            { key: "dept", header: "Department", render: (r: ExpenditureReport) => <span className="font-medium">{r.department?.name}</span> },
            { key: "claimed", header: "Total Claimed", render: (r: ExpenditureReport) => <span className="font-mono">{formatCurrency(r.totalClaimed)}</span> },
            { key: "status", header: "Status", render: (r: ExpenditureReport) => <StatusBadge status={r.status as any} /> },
            { key: "submitted", header: "Submitted", render: (r: ExpenditureReport) => <span className="text-[var(--muted)]">{r.submittedAt ? formatRelative(r.submittedAt) : "—"}</span> },
            { key: "actions", header: "", render: () => <Button variant="ghost" size="sm">Review</Button> },
          ]}
          data={mockExpenditureReports}
        />
      </Card>
    </>
  );
}
