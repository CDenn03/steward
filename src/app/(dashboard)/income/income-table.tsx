"use client";

import { DataTable, createColumnHelper } from "@/components/shared/data-table";
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

const helper = createColumnHelper<IncomeRecord>();

const catVariants: Record<string, "default" | "success" | "info" | "gold" | "warning"> = {
  offering: "default", tithe: "default", donation: "success",
  registration: "info", fundraising: "gold", grant: "warning",
};

const columns = [
  helper.accessor("description", {
    header: "Description",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  helper.accessor("category", {
    header: "Category",
    cell: (info) => <Badge variant={catVariants[info.getValue()] ?? "default"}>{info.getValue()}</Badge>,
  }),
  helper.accessor("date", {
    header: "Date",
    cell: (info) => <span className="text-(--muted)">{formatDate(info.getValue())}</span>,
  }),
  helper.accessor("recordedBy", {
    header: "Recorded By",
    cell: (info) => <span className="text-(--muted)">{info.getValue()}</span>,
  }),
  helper.accessor("amount", {
    header: "Amount",
    cell: (info) => <span className="font-mono font-medium text-success">{formatCurrency(info.getValue())}</span>,
  }),
];

export function IncomeTable({ data }: { data: IncomeRecord[] }) {
  return <DataTable columns={columns} data={data} />;
}
