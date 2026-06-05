"use client";
import { Plus, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockAccounts } from "@/lib/mock/data";
import type { FinancialAccount } from "@/types";

// Mock transactions
const mockTransactions = [
  { id: "t1", account: "Main Operating Account", type: "credit", amount: 85000, description: "Sunday Tithe & Offering", date: new Date("2025-06-01"), category: "Offering" },
  { id: "t2", account: "M-Pesa Till", type: "credit", amount: 22000, description: "M-Pesa Collections", date: new Date("2025-06-01"), category: "Offering" },
  { id: "t3", account: "Main Operating Account", type: "debit", amount: 48000, description: "Youth Camp Transport Disbursement", date: new Date("2025-05-31"), category: "Disbursement" },
  { id: "t4", account: "Main Operating Account", type: "credit", amount: 120000, description: "Easter Conference Registration Fees", date: new Date("2025-05-30"), category: "Registration" },
  { id: "t5", account: "Youth Ministry Fund", type: "credit", amount: 35000, description: "Youth Department Donation", date: new Date("2025-05-28"), category: "Donation" },
  { id: "t6", account: "Main Operating Account", type: "debit", amount: 32500, description: "Sound System Maintenance", date: new Date("2025-05-26"), category: "Operations" },
];

export default function AccountsPage() {
  const totalBalance = mockAccounts.reduce((s, a) => s + a.balance, 0);
  const monthlyIncome = 342000;
  const monthlyExpense = 80500;

  return (
    <>
      <PageHeader title="Accounts" subtitle="All financial accounts and transaction history">
        <Button variant="ghost" size="sm"><Plus size={13} /> Add Account</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Total Liquid Assets" value={formatCurrency(totalBalance, "KES", true)} delta={3.2} deltaLabel="this month" />
        <StatCard label="Monthly Income" value={formatCurrency(monthlyIncome, "KES", true)} delta={14} deltaLabel="vs last month" accentColor="success" />
        <StatCard label="Monthly Expenses" value={formatCurrency(monthlyExpense, "KES", true)} delta={-5} deltaLabel="vs last month" accentColor="warning" />
        <StatCard label="Active Accounts" value={String(mockAccounts.filter(a => a.isActive).length)} deltaLabel="All active" />
      </div>

      {/* Accounts cards */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {mockAccounts.map((acc) => (
          <Card key={acc.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-xl">
                  {acc.type === "mpesa" ? "📱" : acc.type === "savings" ? "💰" : "🏦"}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${acc.isActive ? "bg-success-bg text-success" : "bg-draft-bg text-draft"}`}>
                  {acc.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-[14px] font-medium mb-0.5">{acc.name}</p>
              <p className="text-[11px] text-[var(--muted)] mb-4">{acc.provider} · {acc.accountNumber}</p>
              <div className="border-t border-[var(--border)] pt-3">
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-[0.5px] font-medium mb-1">Balance</p>
                <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(acc.balance)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>
            <p className="text-[14px] font-medium">Recent Transactions</p>
            <p className="text-[12px] text-[var(--muted)]">Across all accounts</p>
          </CardTitle>
          <Button variant="ghost" size="sm"><TrendingUp size={13} /> View All</Button>
        </CardHeader>
        <DataTable
          columns={[
            {
              key: "type",
              header: "Type",
              render: (t: typeof mockTransactions[0]) => (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.type === "credit" ? "bg-success-bg" : "bg-danger-bg"}`}>
                  {t.type === "credit"
                    ? <ArrowDownLeft size={13} className="text-success" />
                    : <ArrowUpRight size={13} className="text-danger" />}
                </div>
              ),
              headerClassName: "w-12",
            },
            {
              key: "desc",
              header: "Description",
              render: (t: typeof mockTransactions[0]) => (
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-[11px] text-[var(--muted)]">{t.account}</p>
                </div>
              ),
            },
            {
              key: "cat",
              header: "Category",
              render: (t: typeof mockTransactions[0]) => (
                <span className="text-[var(--muted)]">{t.category}</span>
              ),
            },
            {
              key: "date",
              header: "Date",
              render: (t: typeof mockTransactions[0]) => (
                <span className="text-[var(--muted)]">{formatDate(t.date)}</span>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              render: (t: typeof mockTransactions[0]) => (
                <span className={`font-mono text-[13px] font-medium ${t.type === "credit" ? "text-success" : "text-danger"}`}>
                  {t.type === "credit" ? "+" : "−"}{formatCurrency(t.amount)}
                </span>
              ),
            },
          ]}
          data={mockTransactions}
        />
      </Card>
    </>
  );
}
