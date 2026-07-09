"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { DataTable, createColumnHelper, type ColumnDef } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { UserActions } from '@/features/admin/components/users/UserActions';

export type MembershipRow = {
  membershipId: string;
  userName: string;
  userEmail: string;
  userInitials: string;
  orgName: string;
  orgColor: string;
  orgInitials: string;
  role: string;
  departmentName: string | null;
  departmentId: string | null;
  orgId: string;
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  chairperson: "Chairperson",
  finance: "Finance",
  department_head: "Dept Head",
  member: "Member",
  platform_admin: "Platform Admin",
};

const roleVariants: Record<string, "default" | "info" | "success" | "gold" | "warning" | "draft"> = {
  admin: "info",
  platform_admin: "info",
  chairperson: "default",
  finance: "success",
  department_head: "gold",
  member: "draft",
};

const helper = createColumnHelper<MembershipRow>();

export function AdminUserTable({
  data,
  departmentsByOrg,
}: {
  data: MembershipRow[];
  departmentsByOrg: Record<string, Array<{ id: string; name: string }>>;
}) {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const orgOptions = useMemo(() => {
    const orgs = new Set(data.map((row) => row.orgName));
    return Array.from(orgs).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        !search ||
        row.userName.toLowerCase().includes(search.toLowerCase()) ||
        row.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchOrg = orgFilter === "all" || row.orgName === orgFilter;
      const matchRole = roleFilter === "all" || row.role === roleFilter;
      return matchSearch && matchOrg && matchRole;
    });
  }, [data, search, orgFilter, roleFilter]);

  const columns = [
    helper.display({
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-(--primary-light) flex items-center justify-center text-[11px] font-semibold text-(--primary) shrink-0">
            {row.original.userInitials}
          </div>
          <div>
            <p className="font-medium text-(--text)">{row.original.userName}</p>
            <p className="text-[11px] text-(--muted)">{row.original.userEmail}</p>
          </div>
        </div>
      ),
    }),
    helper.display({
      id: "org",
      header: "Organisation",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-white text-[9px] font-bold shrink-0"
            style={{ background: row.original.orgColor }}
          >
            {row.original.orgInitials}
          </div>
          <span className="font-medium text-(--text)">{row.original.orgName}</span>
        </div>
      ),
    }),
    helper.accessor("role", {
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={roleVariants[row.original.role] ?? "draft"}>
          {roleLabels[row.original.role] ?? row.original.role}
        </Badge>
      ),
    }),
    helper.accessor("departmentName", {
      header: "Department",
      cell: ({ row }) => (
        <span className="text-(--muted)">{row.original.departmentName ?? "—"}</span>
      ),
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <UserActions
          membershipId={row.original.membershipId}
          currentRole={row.original.role}
          currentDeptId={row.original.departmentId}
          departments={departmentsByOrg[row.original.orgId] ?? []}
        />
      ),
    }),
  ] as ColumnDef<MembershipRow>[];

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] sm:flex-none">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none w-full sm:w-56 focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors"
          />
        </div>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="px-3 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors flex-1 sm:flex-none min-w-[140px]"
        >
          <option value="all">All Organisations</option>
          {orgOptions.map((org) => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors flex-1 sm:flex-none min-w-[140px]"
        >
          <option value="all">All Roles</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <DataTable columns={columns} data={filtered} emptyMessage="No users match your filters" />
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-[13px] text-(--muted) py-8">No users match your filters</p>
        ) : (
          filtered.map((row) => (
            <div
              key={row.membershipId}
              className="bg-(--surface) border border-(--border) rounded-(--r-card) p-4"
            >
              {/* User */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-[8px] bg-(--primary-light) flex items-center justify-center text-[12px] font-semibold text-(--primary) shrink-0">
                  {row.userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-(--text) text-[13.5px] truncate">{row.userName}</p>
                  <p className="text-[11px] text-(--muted) truncate">{row.userEmail}</p>
                </div>
                <Badge variant={roleVariants[row.role] ?? "draft"}>
                  {roleLabels[row.role] ?? row.role}
                </Badge>
              </div>

              {/* Divider */}
              <div className="border-t border-(--border) my-3" />

              {/* Org + Department */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-1">
                    Organisation
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-[6px] flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                      style={{ background: row.orgColor }}
                    >
                      {row.orgInitials}
                    </div>
                    <span className="text-[12.5px] font-medium text-(--text) truncate">{row.orgName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-1">
                    Department
                  </p>
                  <p className="text-[12.5px] text-(--muted)">{row.departmentName ?? "—"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-1 border-t border-(--border)">
                <UserActions
                  membershipId={row.membershipId}
                  currentRole={row.role}
                  currentDeptId={row.departmentId}
                  departments={departmentsByOrg[row.orgId] ?? []}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}