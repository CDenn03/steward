"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CustomTooltip } from '@/components/charts/CustomTooltip';

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
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E3D6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#79766B" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#79766B" }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value / 1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="offerings" name="Offerings" fill="#4B6650" radius={[3, 3, 0, 0]} />
        <Bar dataKey="donations" name="Donations" fill="#A6672E" radius={[3, 3, 0, 0]} />
        <Bar dataKey="other" name="Other" fill="#E8E3D6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
