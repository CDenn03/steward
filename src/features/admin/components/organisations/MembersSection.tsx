"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { DataTable, createColumnHelper, type ColumnDef } from "@/components/shared/DataTable";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

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
  /** Counts for each tab — passed from the parent that has full member list */
  tabCounts?: { active: number; inactive: number; all: number };
}

const helper = createColumnHelper<Member>();

// ── RoleBadge ─────────────────────────────────────────────────────────────────
// Three visual tiers matching the HTML mockup:
//   org-level  (admin, chairperson) → dark fill
//   dept-level (department_head)    → gold
//   functional (finance, member…)   → green
const roleBadgeClass: Record<string, string> = {
  admin:           "bg-ink text-white",
  chairperson:     "bg-ink text-white",
  department_head: "bg-[#F1EAE0] text-[#A6672E]",
  finance:         "bg-linen text-[#4B6650]",
  member:          "bg-linen text-[#4B6650]",
};

const roleLabels: Record<string, string> = {
  admin:           "Admin",
  chairperson:     "Chairperson",
  department_head: "Dept. head",
  finance:         "Finance",
  member:          "Member",
};

function RoleBadge({ role }: { role: string }) {
  const cls = roleBadgeClass[role] ?? "bg-linen text-ink";
  const label = roleLabels[role] ?? (role.charAt(0).toUpperCase() + role.slice(1));
  return (
    <span className={cn("text-[11.5px] font-medium px-2.5 py-1 rounded-full inline-block", cls)}>
      {label}
    </span>
  );
}

// ── Pill tab strip ─────────────────────────────────────────────────────────────
interface PillTabsProps {
  value: string;
  onChange: (v: string) => void;
  tabs: Array<{ value: string; label: string; count: number }>;
}

function PillTabs({ value, onChange, tabs }: PillTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-(--border) p-[3px] rounded-[10px]">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            "px-4 py-[7px] text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer",
            value === t.value
              ? "bg-white text-(--text) shadow-sm"
              : "text-(--muted) hover:text-(--text)"
          )}
        >
          {t.label}{" "}
          <span className={cn("font-normal", value === t.value ? "text-(--muted)" : "text-(--muted)")}>
            ({t.count})
          </span>
        </button>
      ))}
    </div>
  );
}

export function MembersSection({
  members,
  departments,
  currentTab,
  currentDept,
  currentRole,
  currentPage,
  totalPages,
  totalMembers,
  tabCounts,
}: MembersSectionProps) {
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

  const tabs = [
    { value: "active",   label: "Active",   count: tabCounts?.active   ?? 0 },
    { value: "inactive", label: "Inactive", count: tabCounts?.inactive ?? 0 },
    { value: "all",      label: "All",      count: tabCounts?.all      ?? 0 },
  ];

  const columns = useMemo(() => [
    helper.accessor("name", {
      header: "Name",
      cell: ({ row }) => <span className="font-medium text-(--text)">{row.original.name}</span>,
    }),
    helper.accessor("role", {
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    }),
    helper.display({
      id: "department",
      header: "Department",
      cell: ({ row }) => row.original.department
        ? <span className="text-(--muted)">{row.original.department.name}</span>
        : <span className="text-[#B3B0A5]">—</span>,
    }),
    helper.accessor("isActive", {
      header: "Status",
      cell: ({ row }) => row.original.isActive
        ? (
          <span className="flex items-center gap-1.5 text-[#4B6650] font-medium text-[13.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4B6650] shrink-0" aria-hidden />
            Active
          </span>
        ) : (
          <span className="text-(--muted) text-[13.5px]">Inactive</span>
        ),
    }),
    helper.accessor("joinedAt", {
      header: "Joined",
      cell: ({ row }) => <span className="text-(--muted)">{formatDate(row.original.joinedAt)}</span>,
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: () => (
        <button
          className="w-7 h-7 flex items-center justify-center rounded-md text-(--muted) hover:bg-(--bg) hover:text-(--text) transition-colors cursor-pointer"
          aria-label="More options"
        >
          <MoreHorizontal size={16} aria-hidden />
        </button>
      ),
    }),
  ] as ColumnDef<Member>[], []);

  return (
    <div className="mb-9">
      <p className="text-[13px] font-semibold text-(--text) uppercase tracking-wider mb-3">Members</p>

      <div className="bg-white border border-(--border) rounded-2xl overflow-hidden">
        {/* Filters row */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-(--border)">
          <PillTabs
            value={currentTab}
            onChange={(v) => navigate({ tab: v, dept: currentDept, role: currentRole, page: "" })}
            tabs={tabs}
          />
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

        {/* Table */}
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
