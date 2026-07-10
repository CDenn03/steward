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
    <div>
      <div className="flex justify-between items-center pb-2.5">
        <p className="text-[12px] font-semibold text-(--muted) uppercase tracking-[0.03em] mb-2.5">Pending invites</p>
        <div className="flex items-center mb-2.5">
          <Button variant="ghost" size="sm">
            <Plus size={13} className="mr-1.5" />
            New invite
          </Button>
        </div>
      </div>

      <div className="mb-7">
        <DataTable
          columns={columns}
          data={invites}
          emptyMessage="No pending invites."
        />
      </div>
    </div>
  );
}
