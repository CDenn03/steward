"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";

export type TransactionRow = {
  id: string;
  account: string;
  type: string;
  amount: number;
  description: string;
  date: Date;
  category: string;
};

const columns = [
  {
    key: "type",
    header: "Type",
    headerClassName: "w-12",
    render: (t: TransactionRow) => (
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.type === "credit" ? "bg-success-bg" : "bg-danger-bg"}`}>
        {t.type === "credit" ? <ArrowDownLeft size={13} className="text-success" /> : <ArrowUpRight size={13} className="text-danger" />}
      </div>
    ),
  },
  {
    key: "desc",
    header: "Description",
    render: (t: TransactionRow) => (
      <div>
        <p className="font-medium">{t.description}</p>
        <p className="text-[11px] text-(--muted)">{t.account}</p>
      </div>
    ),
  },
  {
    key: "cat",
    header: "Category",
    render: (t: TransactionRow) => <span className="text-(--muted)">{t.category}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (t: TransactionRow) => <span className="text-(--muted)">{formatDate(t.date)}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (t: TransactionRow) => (
      <span className={`font-mono text-[13px] font-medium ${t.type === "credit" ? "text-success" : "text-danger"}`}>
        {t.type === "credit" ? "+" : "-"}{formatCurrency(t.amount)}
      </span>
    ),
  },
];

export function TransactionsTable({ data }: { data: TransactionRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
