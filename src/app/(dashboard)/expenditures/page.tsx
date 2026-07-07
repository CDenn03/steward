import { Plus, Upload } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getExpenditureReportsByOrg, getFinanceDashboard } from "@/features/finance/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ExpendituresTable, type ReportRow } from './ExpendituresTable';
import { formatCurrency } from "@/lib/utils";

type RawReport = {
  id: string;
  department: { name: string } | null;
  status: string;
  totalClaimed: number;
  totalApproved: number | null;
  submittedAt: Date | null;
};

export default async function ExpendituresPage() {
  const session = await requireSession();
  const [reports, stats] = await Promise.all([
    getExpenditureReportsByOrg(session.organizationId),
    getFinanceDashboard(session.organizationId),
  ]);

  const reportRows = reports as RawReport[];
  const rows: ReportRow[] = reportRows.map((report: RawReport) => ({
    id: report.id,
    department: report.department ? { name: report.department.name } : null,
    status: report.status.toLowerCase() as ReportRow["status"],
    totalClaimed: report.totalClaimed,
    totalApproved: report.totalApproved,
    submittedAt: report.submittedAt,
  }));
  const approved = reportRows.reduce((sum: number, report: RawReport) => sum + (report.totalApproved ?? 0), 0);
  const pendingReview = reportRows.filter((report: RawReport) => report.status === "SUBMITTED").length;

  return (
    <>
      <PageHeader title="Expenditures" subtitle="Expenditure reports and receipt accountability">
        <Button variant="ghost" size="sm"><Upload size={13} /> Upload Receipts</Button>
        <Button size="sm"><Plus size={13} /> New Report</Button>
      </PageHeader>
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Total Claimed" value={formatCurrency(stats.totalExpenditure, session.organization.currency, true)} delta={stats.expenditurePct} deltaLabel="of approved budget" />
        <StatCard label="Approved" value={formatCurrency(approved, session.organization.currency, true)} accentColor="success" />
        <StatCard label="Pending Review" value={String(pendingReview)} accentColor="warning" />
        <StatCard label="Outstanding" value={String(stats.outstandingReports)} accentColor="warning" progress={stats.accountabilityRate} progressLabel={`${stats.accountabilityRate}% clear`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle><p className="text-[14px] font-medium">Expenditure Reports</p></CardTitle>
        </CardHeader>
        <ExpendituresTable data={rows} />
      </Card>
    </>
  );
}
