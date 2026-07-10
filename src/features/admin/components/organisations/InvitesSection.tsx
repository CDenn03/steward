"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { DataTable, createColumnHelper, type ColumnDef } from "@/components/shared/DataTable";
import { formatRelative } from "@/lib/utils";

type Invite = {
  id: string;
  email: string;
  role: string;
  invitedBy: { id: string; name: string };
  expiresAt: Date;
  createdAt: Date;
};

interface InvitesSectionProps {
  invites: Invite[];
}

const helper = createColumnHelper<Invite>();

export function InvitesSection({ invites }: InvitesSectionProps) {
  const now = new Date();

  const columns = useMemo(() => [
    helper.accessor("email", {
      header: "Email",
    }),
    helper.accessor("role", {
      header: "Role",
      cell: ({ row }) => (
        <span className="text-(--muted)">
          {row.original.role === "department_head" ? "Dept. Head" : row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
        </span>
      ),
    }),
    helper.display({
      id: "invitedBy",
      header: "Invited by",
      cell: ({ row }) => <span className="text-(--muted)">{row.original.invitedBy.name}</span>,
    }),
    helper.accessor("expiresAt", {
      header: "Expires",
      cell: ({ row }) => {
        const expired = new Date(row.original.expiresAt) < now;
        return (
          <span className={`font-mono ${expired ? "text-rust" : "text-(--muted)"}`}>
            {formatRelative(row.original.expiresAt)}
          </span>
        );
      },
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          <Button variant="ghost" size="sm">Resend</Button>
          <Button variant="ghost" size="sm">Revoke</Button>
        </div>
      ),
    }),
  ] as ColumnDef<Invite>[], []);

  return (
    <div className="mb-9">
      <div className="flex justify-start items-center mb-3">
        <p className="text-[13px] font-semibold text-(--text) uppercase tracking-wider">Pending invites</p>
      </div>

      <div className="bg-white border border-(--border) rounded-2xl overflow-hidden">
        <DataTable
          columns={columns}
          data={invites}
          emptyMessage="No pending invites."
        />
      </div>
    </div>
  );
}
