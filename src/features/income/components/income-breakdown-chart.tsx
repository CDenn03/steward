"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CustomTooltip } from "@/components/charts/custom-tooltip";

type IncomeMonth = {
  month: string;
  offerings: number;
  donations: number;
  other: number;
};

export function IncomeBreakdownChart({ data }: { data: IncomeMonth[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value / 1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="offerings" name="Offerings" fill="#1F4B99" radius={[3, 3, 0, 0]} />
        <Bar dataKey="donations" name="Donations" fill="#C8A04D" radius={[3, 3, 0, 0]} />
        <Bar dataKey="other" name="Other" fill="#E6EAF0" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
