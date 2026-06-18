"use client";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export type IncomeRecord = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: Date;
  recordedBy: string;
};

const catVariants: Record<string, "default" | "success" | "info" | "gold" | "warning"> = {
  offering: "default", tithe: "default", donation: "success",
  registration: "info", fundraising: "gold", grant: "warning",
};

const columns = [
  { key: "desc", header: "Description", render: (r: IncomeRecord) => <span className="font-medium">{r.description}</span> },
  { key: "cat", header: "Category", render: (r: IncomeRecord) => <Badge variant={catVariants[r.category] ?? "default"}>{r.category}</Badge> },
  { key: "date", header: "Date", render: (r: IncomeRecord) => <span className="text-(--muted)">{formatDate(r.date)}</span> },
  { key: "by", header: "Recorded By", render: (r: IncomeRecord) => <span className="text-(--muted)">{r.recordedBy}</span> },
  { key: "amount", header: "Amount", render: (r: IncomeRecord) => <span className="font-mono font-medium text-success">{formatCurrency(r.amount)}</span> },
];

export function IncomeTable({ data }: { data: IncomeRecord[] }) {
  return <DataTable columns={columns} data={data} />;
}
