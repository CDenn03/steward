"use client";

import { useState } from "react";
import { Users, MoreHorizontal, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: { id: string; name: string } | null;
  isActive: boolean;
  joinedAt: Date;
  initials: string;
};

interface MembersSectionProps {
  members: Member[];
  departments: Array<{ id: string; name: string }>;
}

type Tab = "active" | "inactive" | "all";

export function MembersSection({ members, departments }: MembersSectionProps) {
  const [tab, setTab] = useState<Tab>("active");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = members.filter((m) => {
    if (tab !== "all" && tab === "active" && !m.isActive) return false;
    if (tab !== "all" && tab === "inactive" && m.isActive) return false;
    if (deptFilter !== "all" && m.department?.id !== deptFilter) return false;
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "all", label: "All" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="m-0 text-[15px] font-medium flex items-center gap-1.5">
          <Users size={18} className="text-(--muted)" aria-hidden />
          Members
        </h3>
        <div className="flex gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-32.5 text-[13px] px-2 py-1.5 rounded-(--r-btn) border border-(--border) bg-(--surface) text-(--text) outline-none"
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-27.5 text-[13px] px-2 py-1.5 rounded-(--r-btn) border border-(--border) bg-(--surface) text-(--text) outline-none"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="finance">Finance</option>
            <option value="chairperson">Chairperson</option>
            <option value="department_head">Dept. Head</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1 border-b-[0.5px] border-(--border) mb-2.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-none bg-none px-1 py-1.5 mr-3.5 text-[13px] font-medium cursor-pointer transition-colors ${
              tab === t.key
                ? "text-(--text) border-b-2 border-(--primary)"
                : "text-(--muted) border-b-2 border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="border-[0.5px] border-(--border) rounded-(--r-card) overflow-hidden mb-7">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-(--surface)">
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Name</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Role</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Department</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Status</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Joined</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t-[0.5px] border-(--border)">
                <td className="py-2.5 px-3 font-medium">{m.name}</td>
                <td className="py-2.5 px-3">
                  <RoleBadge role={m.role} />
                </td>
                <td className="py-2.5 px-3 text-(--muted)">{m.department?.name ?? "—"}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center gap-1.5 ${m.isActive ? "text-green-600" : "text-(--muted)"}`}>
                    <Circle size={8} fill="currentColor" aria-hidden />
                    {m.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-(--muted)">{formatDate(m.joinedAt)}</td>
                <td className="py-2.5 px-3 text-right">
                  <button className="border-none bg-none cursor-pointer text-(--muted)">
                    <MoreHorizontal size={16} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[13px] text-(--muted)">
                  No members match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin" || role === "chairperson" || role === "finance";
  return (
    <span
      className={`inline-block rounded-(--r-card) px-2 py-0.5 text-[12px] ${
        isAdmin
          ? "bg-(--bg-accent) text-(--primary)"
          : "bg-(--surface) border-[0.5px] border-(--border) text-(--muted)"
      }`}
    >
      {role === "department_head" ? "Dept. Head" : role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}
