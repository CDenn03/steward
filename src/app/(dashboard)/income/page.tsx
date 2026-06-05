"use client";
import { Plus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { CustomTooltip } from "@/components/charts/custom-tooltip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockIncomeMonthly } from "@/lib/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const mockIncomeRecords = [
  { id: "i1", description: "Sunday Tithe & Offering",         category: "offering",      amount: 85000,  date: new Date("2025-06-01"), recordedBy: "Grace Wanjiku" },
  { id: "i2", description: "Youth Camp Registrations",        category: "registration",  amount: 30000,  date: new Date("2025-05-31"), recordedBy: "James Mwangi" },
  { id: "i3", description: "Anonymous Donation — Building",   category: "donation",      amount: 50000,  date: new Date("2025-05-28"), recordedBy: "James Mwangi" },
  { id: "i4", description: "Easter Conference Offering",      category: "offering",      amount: 120000, date: new Date("2025-04-20"), recordedBy: "Grace Wanjiku" },
  { id: "i5", description: "Missions Fundraiser",             category: "fundraising",   amount: 84000,  date: new Date("2025-04-15"), recordedBy: "Sarah Kamau" },
  { id: "i6", description: "Community Grant — Medical Camp",  category: "grant",         amount: 150000, date: new Date("2025-04-10"), recordedBy: "James Mwangi" },
];

type IncomeRecord = typeof mockIncomeRecords[number];

const catVariants: Record<string, "default" | "success" | "info" | "gold" | "warning"> = {
  offering:     "default",
  donation:     "success",
  registration: "info",
  fundraising:  "gold",
  grant:        "warning",
};

export default function IncomePage() {
  return (
    <>
      <PageHeader title="Income" subtitle="Track all income sources — offerings, donations, registrations, grants">
        <Button variant="ghost" size="sm"><TrendingUp size={13} /> Reports</Button>
        <Button size="sm"><Plus size={13} /> Record Income</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="This Month"       value="KES 342,000" delta={14} deltaLabel="vs last month" accentColor="success" />
        <StatCard label="Tithes & Offerings" value="KES 228,000" delta={8}  accentColor="success" />
        <StatCard label="Donations"        value="KES 84,000"  delta={22} accentColor="gold" />
        <StatCard label="Other Sources"    value="KES 30,000"  deltaLabel="Event registrations" />
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Monthly Breakdown</p></CardTitle>
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockIncomeMonthly} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="offerings" name="Offerings" fill="#1F4B99" radius={[3, 3, 0, 0]} />
                <Bar dataKey="donations" name="Donations" fill="#C8A04D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="other"     name="Other"     fill="#E6EAF0" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">By Category</p></CardTitle>
          </CardHeader>
          <div className="divide-y divide-[var(--border)]">
            {[
              { cat: "Tithes & Offerings", amount: 228000, pct: 67 },
              { cat: "Donations",          amount: 84000,  pct: 25 },
              { cat: "Registrations",      amount: 30000,  pct: 9  },
            ].map((r) => (
              <div key={r.cat} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-medium">{r.cat}</span>
                    <span className="font-mono text-[12.5px]">{formatCurrency(r.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
                <span className="text-[11px] text-[var(--muted)] w-8 text-right">{r.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><p className="text-[14px] font-medium">Income Records</p></CardTitle>
        </CardHeader>
        <DataTable
          columns={[
            { key: "desc",   header: "Description", render: (r: IncomeRecord) => <span className="font-medium">{r.description}</span> },
            { key: "cat",    header: "Category",    render: (r: IncomeRecord) => <Badge variant={catVariants[r.category] ?? "default"}>{r.category}</Badge> },
            { key: "date",   header: "Date",        render: (r: IncomeRecord) => <span className="text-[var(--muted)]">{formatDate(r.date)}</span> },
            { key: "by",     header: "Recorded By", render: (r: IncomeRecord) => <span className="text-[var(--muted)]">{r.recordedBy}</span> },
            { key: "amount", header: "Amount",      render: (r: IncomeRecord) => <span className="font-mono font-medium text-success">{formatCurrency(r.amount)}</span> },
          ]}
          data={mockIncomeRecords}
        />
      </Card>
    </>
  );
}
