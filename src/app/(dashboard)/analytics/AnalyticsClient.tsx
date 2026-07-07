"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CustomTooltip } from '@/components/charts/CustomTooltip';
import { formatCurrency, pct } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#1F4B99", "#C8A04D", "#15803D", "#D97706", "#64748B", "#2563EB"];

type DepartmentSpend = {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  variance: number;
};

type MonthlyIncome = {
  month: string;
  offerings: number;
  donations: number;
  other: number;
};

export function AnalyticsClient({
  departmentSpend,
  monthlyIncome,
  currency,
  years,
  selectedYear,
}: {
  departmentSpend: DepartmentSpend[];
  monthlyIncome: MonthlyIncome[];
  currency: string;
  years: number[];
  selectedYear: number;
}) {
  const router = useRouter();
  const pieData = departmentSpend.map((department) => ({
    name: department.name,
    value: department.allocated,
  }));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Budget variance, income trends, and department utilisation">

        <select
          value={selectedYear}
          onChange={(e) => router.push(`/analytics?year=${e.target.value}`)}
          className="px-3 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Department Budget vs Spend</p></CardTitle>
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={departmentSpend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="allocated" name="Allocated" fill="#E6EAF0" radius={[3, 3, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#1F4B99" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Income Trend for {selectedYear}</p></CardTitle>
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyIncome} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="offerings" name="Offerings" stroke="#1F4B99" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="donations" name="Donations" stroke="#C8A04D" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-4">
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Budget Allocation by Dept</p></CardTitle>
          </CardHeader>
          <div className="p-5 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((department, i) => <Cell key={department.name} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {pieData.map((department, i) => (
              <div key={department.name} className="flex items-center gap-2 text-[12px]">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1">{department.name}</span>
                <span className="font-mono text-(--muted)">{formatCurrency(department.value, currency, true)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Budget Variance Report</p></CardTitle>
          </CardHeader>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-(--border) bg-(--bg)">
                {["Department", "Allocated", "Spent", "Variance", "Util."].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentSpend.map((department) => {
                const percent = pct(department.spent, department.allocated);
                return (
                  <tr key={department.id} className="border-b border-(--border) last:border-0 hover:bg-(--bg) transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium">{department.name}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-(--muted)">{formatCurrency(department.allocated, currency, true)}</td>
                    <td className="px-4 py-3 text-[13px] font-mono">{department.spent > 0 ? formatCurrency(department.spent, currency, true) : "-"}</td>
                    <td className={`px-4 py-3 text-[13px] font-mono ${department.variance >= 0 ? "text-success" : "text-danger"}`}>
                      {department.spent > 0 ? `${department.variance >= 0 ? "+" : ""}${formatCurrency(department.variance, currency, true)}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-(--border) rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${percent >= 95 ? "bg-danger" : percent >= 80 ? "bg-warning" : "bg-(--primary)"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-(--muted) w-8 text-right">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
