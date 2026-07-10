"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { DataTable, createColumnHelper } from '@/components/shared/DataTable';
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

const helper = createColumnHelper<TransactionRow>();

const columns = [
  helper.accessor("type", {
    header: "Type",
    cell: (info) => {
      const type = info.getValue();
      return (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${type === "credit" ? "bg-success-bg" : "bg-danger-bg"}`}>
          {type === "credit" ? <ArrowDownLeft size={13} className="text-success" /> : <ArrowUpRight size={13} className="text-danger" />}
        </div>
      );
    },
  }),
  helper.accessor("description", {
    header: "Description",
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        <p className="text-[12px] text-(--muted)">{info.row.original.account}</p>
      </div>
    ),
  }),
  helper.accessor("category", {
    header: "Category",
    cell: (info) => <span className="text-(--muted)">{info.getValue()}</span>,
  }),
  helper.accessor("date", {
    header: "Date",
    cell: (info) => <span className="text-(--muted)">{formatDate(info.getValue())}</span>,
  }),
  helper.accessor("amount", {
    header: "Amount",
    cell: (info) => {
      const type = info.row.original.type;
      return (
        <span className={`font-mono text-[14px] font-medium ${type === "credit" ? "text-success" : "text-danger"}`}>
          {type === "credit" ? "+" : "-"}{formatCurrency(info.getValue())}
        </span>
      );
    },
  }),
];

export function TransactionsTable({ data }: { data: TransactionRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
