"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip } from "@/components/charts/custom-tooltip";
import { formatCurrency, pct } from "@/lib/utils";
import { mockBudgets, mockDepartments, mockIncomeMonthly } from "@/lib/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#1F4B99", "#C8A04D", "#15803D", "#D97706", "#64748B", "#2563EB"];

export default function AnalyticsPage() {
  const deptSpend = mockDepartments
    .map((d) => {
      const budgets = mockBudgets.filter((b) => b.departmentId === d.id);
      const allocated = budgets.reduce((s, b) => s + b.totalAmount, 0);
      const spent = budgets.reduce((s, b) => s + (b.spentAmount ?? 0), 0);
      return { name: d.name.split(" ")[0], allocated, spent, variance: allocated - spent };
    })
    .filter((d) => d.allocated > 0);

  const pieData = deptSpend.map((d) => ({ name: d.name, value: d.allocated }));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Budget variance, income trends, and department utilisation" />

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Department Budget vs Spend */}
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Department Budget vs Spend</p></CardTitle>
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptSpend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="allocated" name="Allocated" fill="#E6EAF0" radius={[3, 3, 0, 0]} />
                <Bar dataKey="spent"     name="Spent"     fill="#1F4B99" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Income Trend */}
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Income Trend</p></CardTitle>
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mockIncomeMonthly} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="offerings" name="Offerings" stroke="#1F4B99" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="donations" name="Donations" stroke="#C8A04D" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-4">
        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Budget Allocation by Dept</p></CardTitle>
          </CardHeader>
          <div className="p-5 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-[12px]">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1">{d.name}</span>
                <span className="font-mono text-[var(--muted)]">{formatCurrency(d.value, "KES", true)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Variance table */}
        <Card>
          <CardHeader>
            <CardTitle><p className="text-[14px] font-medium">Budget Variance Report</p></CardTitle>
          </CardHeader>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                {["Department", "Allocated", "Spent", "Variance", "Util."].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptSpend.map((d) => {
                const p = pct(d.spent, d.allocated);
                return (
                  <tr key={d.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-[var(--muted)]">{formatCurrency(d.allocated, "KES", true)}</td>
                    <td className="px-4 py-3 text-[13px] font-mono">{d.spent > 0 ? formatCurrency(d.spent, "KES", true) : "—"}</td>
                    <td className={`px-4 py-3 text-[13px] font-mono ${d.variance >= 0 ? "text-success" : "text-danger"}`}>
                      {d.spent > 0 ? `${d.variance >= 0 ? "+" : ""}${formatCurrency(d.variance, "KES", true)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p >= 95 ? "bg-danger" : p >= 80 ? "bg-warning" : "bg-[var(--primary)]"}`}
                            style={{ width: `${p}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[var(--muted)] w-8 text-right">{p}%</span>
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
