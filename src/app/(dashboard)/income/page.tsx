import { Plus, TrendingUp } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import {
  getIncomeMonthlyBreakdown,
  getIncomeRecordsByOrg,
  getIncomeSummary,
  getFinancialAccountsByOrg,
} from "@/features/finance/repositories";
import { getBudgetFormOptions } from "@/features/budgets/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { IncomeTable, type IncomeRecord } from "./income-table";
import { formatCurrency } from "@/lib/utils";
import { IncomeBreakdownChart } from "@/features/income/components/income-breakdown-chart";
import { RecordIncomeActionButton } from "./record-income-button";

type RawIncomeRecord = {
  id: string;
  description: string;
  category: string;
  amount: number;
  receivedAt: Date;
  recordedById: string;
};

export default async function IncomePage() {
  const session = await requireSession();
  const [summary, monthly, rawRecords, accounts, formOptions] = await Promise.all([
    getIncomeSummary(session.organizationId),
    getIncomeMonthlyBreakdown(session.organizationId),
    getIncomeRecordsByOrg(session.organizationId),
    getFinancialAccountsByOrg(session.organizationId),
    getBudgetFormOptions(session.organizationId),
  ]);

  const records: IncomeRecord[] = (rawRecords as RawIncomeRecord[]).map((record: RawIncomeRecord) => ({
    id: record.id,
    description: record.description,
    category: record.category.toLowerCase(),
    amount: record.amount,
    date: record.receivedAt,
    recordedBy: record.recordedById,
  }));

  const categoryRows = [
    { cat: "Tithes & Offerings", amount: summary.offerings },
    { cat: "Donations", amount: summary.donations },
    { cat: "Other Sources", amount: summary.other },
  ].map((row) => ({
    ...row,
    pct: summary.total > 0 ? Math.round((row.amount / summary.total) * 100) : 0,
  }));

  return (
    <>
      <PageHeader title="Income" subtitle="Track all income sources — offerings, donations, registrations, grants">
        <Button variant="ghost" size="sm"><TrendingUp size={13} /> Reports</Button>
        <RecordIncomeActionButton accounts={accounts} departments={formOptions.departments} events={formOptions.events} />
      </PageHeader>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="This Month" value={formatCurrency(summary.total, session.organization.currency, true)} deltaLabel="recorded" accentColor="success" />
        <StatCard label="Tithes & Offerings" value={formatCurrency(summary.offerings, session.organization.currency, true)} accentColor="success" />
        <StatCard label="Donations" value={formatCurrency(summary.donations, session.organization.currency, true)} accentColor="gold" />
        <StatCard label="Other Sources" value={formatCurrency(summary.other, session.organization.currency, true)} />
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Monthly Breakdown</p></CardTitle>
          </CardHeader>
          <div className="p-5">
            <IncomeBreakdownChart data={monthly} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">By Category</p></CardTitle>
          </CardHeader>
          <div className="divide-y divide-(--border)">
            {categoryRows.map((row) => (
              <div key={row.cat} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-medium">{row.cat}</span>
                    <span className="font-mono text-[12.5px]">{formatCurrency(row.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-(--border) rounded-full overflow-hidden">
                    <div className="h-full bg-(--primary) rounded-full" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
                <span className="text-[11px] text-(--muted) w-8 text-right">{row.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><p className="text-[14px] font-medium">Income Records</p></CardTitle>
        </CardHeader>
        <IncomeTable data={records} />
      </Card>
    </>
  );
}
