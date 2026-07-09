"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Eye, Edit2, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable, createColumnHelper, type ColumnDef } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { UserDetailModal } from '@/features/admin/components/users/UserDetailModal';
import { deleteUserAction } from "@/features/admin/actions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import type { AdminUser } from "@/features/admin/repositories";

const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  admin: "Admin",
  chairperson: "Chairperson",
  finance: "Finance",
  department_head: "Dept Head",
  member: "Member",
};

const avatarPalette = [
  { bg: "var(--primary-light)", fg: "var(--primary)" },
  { bg: "var(--gold-light)", fg: "var(--gold)" },
  { bg: "var(--success-bg)", fg: "var(--success)" },
  { bg: "var(--info-bg)", fg: "var(--info)" },
  { bg: "var(--warning-bg)", fg: "var(--warning)" },
];
function colorForUser(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + (c.codePointAt(0) ?? 0), 0);
  return avatarPalette[hash % avatarPalette.length];
}

const helper = createColumnHelper<AdminUser>();

type Org = { id: string; name: string; slug: string; primaryColor: string; logoInitials: string };

export function PlatformUsersTable({
  data,
  organizations,
  search: initialSearch = "",
  orgFilter: initialOrgFilter = "",
  roleFilter: initialRoleFilter = "",
  page = 0,
  totalPages = 1,
}: Readonly<{
  data: AdminUser[];
  organizations: Org[];
  search?: string;
  orgFilter?: string;
  roleFilter?: string;
  page?: number;
  totalPages?: number;
}>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `/platform-admin/users?${qs}` : "/platform-admin/users";
  };

  const navigate = (overrides: Record<string, string>) => {
    router.push(buildUrl(overrides));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ search: value, page: "", orgId: searchParams.get("orgId") ?? "", role: searchParams.get("role") ?? "" });
    }, 350);
  };

  const handleOrgChange = (value: string) => {
    navigate({ orgId: value === "all" ? "" : value, page: "", search: searchParams.get("search") ?? "", role: searchParams.get("role") ?? "" });
  };

  const handleRoleChange = (value: string) => {
    navigate({ role: value === "all" ? "" : value, page: "", search: searchParams.get("search") ?? "", orgId: searchParams.get("orgId") ?? "" });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ page: String(newPage + 1), search: searchParams.get("search") ?? "", orgId: searchParams.get("orgId") ?? "", role: searchParams.get("role") ?? "" });
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditing, setModalEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openView = (user: AdminUser) => { setSelectedUser(user); setModalEditing(false); setModalOpen(true); };
  const openEdit = (user: AdminUser) => { setSelectedUser(user); setModalEditing(true); setModalOpen(true); };

  const columns = useMemo(() => [
    helper.display({
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const c = colorForUser(row.original.id);
        return (
          <div className="flex items-center gap-3 py-1">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[12px] font-semibold shrink-0"
              style={{ background: c.bg, color: c.fg }}
            >
              {row.original.initials}
            </div>
            <span className="font-medium text-(--text) text-[13.5px]">{row.original.name}</span>
          </div>
        );
      },
    }),
    helper.accessor("email", {
      header: "Email",
      cell: ({ row }) => <span className="text-(--muted) text-[13px]">{row.original.email}</span>,
    }),
    helper.display({
      id: "orgs",
      header: "Organisations & Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original.memberships.map((membership) => (
            <span
              key={membership.id}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-(--bg) border border-(--border) rounded-full pl-1.5 pr-2.5 py-1"
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                style={{ background: membership.org.primaryColor }}
              >
                {membership.org.logoInitials}
              </span>
              {roleLabels[membership.role] ?? membership.role}
            </span>
          ))}
        </div>
      ),
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openView(row.original)}
            className="w-8 h-8 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--primary) hover:bg-(--primary-light) transition-colors cursor-pointer"
            title="View user"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEdit(row.original)}
            className="w-8 h-8 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--primary) hover:bg-(--primary-light) transition-colors cursor-pointer"
            title="Edit user"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row.original)}
            className="w-8 h-8 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--danger) hover:bg-(--danger-bg) transition-colors cursor-pointer"
            title="Delete user"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ] as ColumnDef<AdminUser>[], []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteUserAction(deleteTarget.id);
    setDeleteLoading(false);
    setDeleteTarget(null);
    router.refresh();
  };
  const selectedOrg = organizations.find(
  (org) => org.id === initialOrgFilter
);

  return (
    <div className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 p-5 border-b border-(--border) flex-wrap">
        <div className="relative flex-1 min-w-[200px] sm:flex-none sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-3 py-2 text-[13px] bg-(--bg) border border-(--border) rounded-(--r-input) outline-none w-full focus:border-(--primary) focus:bg-(--surface) text-(--text) placeholder:text-(--muted) transition-colors"
          />
        </div>

        <div className="w-full sm:w-44">
          <Select value={initialOrgFilter || "all"} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Organisations">
                {selectedOrg?.name ?? "All Organisations"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organisations</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-44">
          <Select value={initialRoleFilter || "all"} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Roles">
                {initialRoleFilter ? roleLabels[initialRoleFilter] ?? initialRoleFilter : "All Roles"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden sm:block px-2 pb-2">
        <DataTable
          columns={columns}
          data={data}
          pageSize={20}
          manualPagination
          pageCount={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>

      <div className="sm:hidden divide-y divide-(--border)">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-(--muted)">
            <Users size={28} className="mb-2 opacity-40" />
            <p className="text-[13px]">No users match your filters</p>
          </div>
        ) : (
          data.map((user) => {
            const c = colorForUser(user.id);
            return (
              <div key={user.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[13px] font-semibold shrink-0"
                    style={{ background: c.bg, color: c.fg }}
                  >
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-(--text) text-[14px] truncate">{user.name}</p>
                    <p className="text-[12px] text-(--muted) truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {user.memberships.map((membership) => (
                    <span
                      key={membership.id}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-(--bg) border border-(--border) rounded-full pl-1.5 pr-2.5 py-1"
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                        style={{ background: membership.org.primaryColor }}
                      >
                        {membership.org.logoInitials}
                      </span>
                      {roleLabels[membership.role] ?? membership.role}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openView(user)}
                    className="w-9 h-9 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--primary) hover:bg-(--primary-light) transition-colors cursor-pointer"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => openEdit(user)}
                    className="w-9 h-9 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--primary) hover:bg-(--primary-light) transition-colors cursor-pointer"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(user)}
                    className="w-9 h-9 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--danger) hover:bg-(--danger-bg) transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 text-[13px] text-(--muted)">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 0}
                className="p-1 rounded-md hover:bg-(--bg) disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-1 rounded-md hover:bg-(--bg) disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          organizations={organizations}
          open={modalOpen}
          defaultEditing={modalEditing}
          onClose={() => { setModalOpen(false); setSelectedUser(null); setModalEditing(false); }}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove the user and all their memberships, sessions, and accounts. This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}