import { Plus, TrendingUp } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import {
  getFinancialAccountsByOrg,
  getIncomeSummary,
  getRecentAccountTransactions,
} from "@/features/finance/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { TransactionsTable, type TransactionRow } from "./transactions-table";
import { formatCurrency } from "@/lib/utils";

type AccountRow = {
  id: string;
  name: string;
  accountNumber: string | null;
  provider: string | null;
  type: string;
  balance: number;
  currency: string;
  isActive: boolean;
};

type RawTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  reference: string | null;
  transactedAt: Date;
  account: { name: string };
};

export default async function AccountsPage() {
  const session = await requireSession();
  const [accounts, transactions, incomeSummary] = await Promise.all([
    getFinancialAccountsByOrg(session.organizationId),
    getRecentAccountTransactions(session.organizationId),
    getIncomeSummary(session.organizationId),
  ]);

  const accountRows = accounts as AccountRow[];
  const transactionRows = transactions as RawTransaction[];
  const totalBalance = accountRows.reduce((sum: number, account: AccountRow) => sum + account.balance, 0);
  const monthlyExpense = transactionRows
    .filter((transaction: RawTransaction) => transaction.type.toLowerCase() === "debit")
    .reduce((sum: number, transaction: RawTransaction) => sum + transaction.amount, 0);
  const rows: TransactionRow[] = transactionRows.map((transaction: RawTransaction) => ({
    id: transaction.id,
    account: transaction.account.name,
    type: transaction.type.toLowerCase(),
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.transactedAt,
    category: transaction.reference ?? transaction.type,
  }));

  return (
    <>
      <PageHeader title="Accounts" subtitle="All financial accounts and transaction history">
        <Button variant="ghost" size="sm"><Plus size={13} /> Add Account</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Total Liquid Assets" value={formatCurrency(totalBalance, session.organization.currency, true)} deltaLabel="current balance" />
        <StatCard label="Monthly Income" value={formatCurrency(incomeSummary.total, session.organization.currency, true)} deltaLabel="this month" accentColor="success" />
        <StatCard label="Monthly Expenses" value={formatCurrency(monthlyExpense, session.organization.currency, true)} deltaLabel="recent debits" accentColor="warning" />
        <StatCard label="Active Accounts" value={String(accountRows.filter((account: AccountRow) => account.isActive).length)} deltaLabel="All active" />
      </div>

      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {accountRows.map((account: AccountRow) => (
          <Card key={account.id} className="hover:shadow-card-hover transition-shadow">
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[10px] font-semibold">
                  {account.type}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${account.isActive ? "bg-success-bg text-success" : "bg-draft-bg text-draft"}`}>
                  {account.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-[14px] font-medium mb-0.5">{account.name}</p>
              <p className="text-[11px] text-[var(--muted)] mb-4">{account.provider ?? "Provider"} · {account.accountNumber ?? "No account number"}</p>
              <div className="border-t border-[var(--border)] pt-3">
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-[0.5px] font-medium mb-1">Balance</p>
                <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(account.balance, account.currency)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <p className="text-[14px] font-medium">Recent Transactions</p>
            <p className="text-[12px] text-[var(--muted)]">Across all accounts</p>
          </CardTitle>
          <Button variant="ghost" size="sm"><TrendingUp size={13} /> View All</Button>
        </CardHeader>
        <TransactionsTable data={rows} />
      </Card>
    </>
  );
}
