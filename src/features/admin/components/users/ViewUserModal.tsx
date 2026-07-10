"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import type { AdminUser } from "@/features/admin/repositories";

const roleLabels: Record<string, string> = {
  platform_admin:  "Platform Admin",
  admin:           "Admin",
  chairperson:     "Chairperson",
  finance:         "Finance",
  department_head: "Dept Head",
  member:          "Member",
};

const roleVariants: Record<string, "default" | "info" | "success" | "gold" | "warning" | "draft"> = {
  platform_admin:  "info",
  admin:           "info",
  chairperson:     "default",
  finance:         "success",
  department_head: "gold",
  member:          "draft",
};

interface ViewUserModalProps {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function ViewUserModal({ user, open, onClose, onEdit }: Readonly<ViewUserModalProps>) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent aria-label={user.name || "User"}>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div>
            <p className="text-[13px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">
              Member Details
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[14px]">
                <span className="text-(--muted) w-16">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[14px]">
                <span className="text-(--muted) w-16">Email</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">
              Memberships ({user.memberships.length})
            </p>
            <div className="space-y-2">
              {user.memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center gap-3 bg-(--bg) border border-(--border) rounded-[10px] px-3.5 py-3"
                >
                  <div
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ background: membership.org.primaryColor }}
                  >
                    {membership.org.logoInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">{membership.org.name}</p>
                    <p className="text-[12px] text-(--muted)">
                      {roleLabels[membership.role] ?? membership.role}
                    </p>
                  </div>
                  <Badge variant={roleVariants[membership.role] ?? "draft"}>
                    {roleLabels[membership.role] ?? membership.role}
                  </Badge>
                </div>
              ))}
              {user.memberships.length === 0 && (
                <p className="text-[13px] text-(--muted) italic">No memberships.</p>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button size="sm" onClick={onEdit}>
              <Pencil size={12} /> Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
