"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DataTable, createColumnHelper, type ColumnDef } from "@/components/shared/DataTable";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

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
  currentTab: string;
  currentDept: string;
  currentRole: string;
  currentPage: number;
  totalPages: number;
  totalMembers: number;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  member: "Member",
  finance: "Finance",
  chairperson: "Chairperson",
  department_head: "Dept. Head",
};

const helper = createColumnHelper<Member>();

function RoleBadge({ role }: { role: string }) {
  const roleBadgeClass: Record<string, string> = {
    chairperson: "bg-ink text-white",
    department_head: "bg-clay-light text-clay",
    finance: "bg-moss-light text-moss",
    default: "bg-linen text-ink",
  };

  const cls = roleBadgeClass[role] || roleBadgeClass.default;
  const displayName = role === "department_head" ? "Dept. Head" : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span className={`${cls} text-xs font-semibold px-2.5 py-1 rounded-full w-fit`}>
      {displayName}
    </span>
  );
}

export function MembersSection({ members, departments, currentTab, currentDept, currentRole, currentPage, totalPages, totalMembers }: MembersSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  const navigate = (overrides: Record<string, string>) => {
    router.push(buildUrl(overrides), { scroll: false });
  };

  const handlePageChange = (page: number) => {
    navigate({ tab: currentTab, dept: currentDept, role: currentRole, page: page > 1 ? String(page) : "" });
  };

  const columns = useMemo(() => [
    helper.accessor("name", {
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    }),
    helper.accessor("role", {
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    }),
    helper.display({
      id: "department",
      header: "Department",
      cell: ({ row }) => <span className="text-(--muted)">{row.original.department?.name ?? "—"}</span>,
    }),
    helper.accessor("isActive", {
      header: "Status",
      cell: ({ row }) => (
        <span className={`text-sm font-semibold ${row.original.isActive ? "text-moss" : "text-warmgray"}`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    }),
    helper.accessor("joinedAt", {
      header: "Joined",
      cell: ({ row }) => <span className="font-mono text-(--muted)">{formatDate(row.original.joinedAt)}</span>,
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: () => (
        <button className="border-none bg-none cursor-pointer text-(--muted) hover:text-(--text) transition-colors">
          <MoreHorizontal size={16} aria-hidden />
        </button>
      ),
    }),
  ] as ColumnDef<Member>[], []);

  return (
    <div>
      <p className="text-[12px] font-semibold text-(--muted) uppercase tracking-[0.03em] mb-2.5">Members</p>
      <div className="flex items-center justify-between gap-3 mb-2.5 border-b border-(--border)">
        <Tabs value={currentTab} onValueChange={(v) => navigate({ tab: v, dept: currentDept, role: currentRole, page: "" })}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Select value={currentDept} onValueChange={(v) => navigate({ tab: currentTab, dept: v, role: currentRole, page: "" })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currentRole} onValueChange={(v) => navigate({ tab: currentTab, dept: currentDept, role: v, page: "" })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="chairperson">Chairperson</SelectItem>
              <SelectItem value="department_head">Dept. Head</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[13px] text-(--muted)">
          {totalMembers} member{totalMembers !== 1 ? "s" : ""}
          {totalPages > 1 && <> &middot; Page {currentPage} of {totalPages}</>}
        </p>
      </div>

      <div className="mb-7">
        <DataTable
          columns={columns}
          data={members}
          emptyMessage="No members match the current filters."
          manualPagination
          pageCount={totalPages}
          currentPage={currentPage - 1}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
