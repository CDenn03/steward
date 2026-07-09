"use client";

import { Mail, Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';
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

export function InvitesSection({ invites }: InvitesSectionProps) {
  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="m-0 text-[15px] font-medium flex items-center gap-1.5">
          <Mail size={18} className="text-(--muted)" aria-hidden />
          Pending invites
        </h3>
        <Button variant="ghost" size="sm">
          <Plus size={13} className="mr-1.5" />
          New invite
        </Button>
      </div>

      <div className="border-[0.5px] border-(--border) rounded-(--r-card) overflow-hidden mb-7">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-(--surface)">
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Email</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Role</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Invited by</th>
              <th className="text-left py-2 px-3 text-(--muted) font-medium">Expires</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {invites.map((i) => {
              const expired = new Date(i.expiresAt) < now;
              return (
                <tr key={i.id} className="border-t-[0.5px] border-(--border)">
                  <td className="py-2.5 px-3">{i.email}</td>
                  <td className="py-2.5 px-3 text-(--muted)">
                    {i.role === "department_head" ? "Dept. Head" : i.role.charAt(0).toUpperCase() + i.role.slice(1)}
                  </td>
                  <td className="py-2.5 px-3 text-(--muted)">{i.invitedBy.name}</td>
                  <td className={`py-2.5 px-3 font-mono ${expired ? "text-red-500" : "text-(--muted)"}`}>
                    {formatRelative(i.expiresAt)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                    <Button variant="ghost" size="sm">Resend</Button>
                    <Button variant="ghost" size="sm">Revoke</Button>
                  </td>
                </tr>
              );
            })}
            {invites.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[13px] text-(--muted)">
                  No pending invites.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
