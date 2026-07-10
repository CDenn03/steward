"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";

import {
  updateUserAction,
  updatePlatformMembershipAction,
  removePlatformMembershipAction,
  createPlatformMembershipAction,
} from "@/features/admin/actions";
import type { AdminUser } from "@/features/admin/repositories";

const ROLE_OPTIONS = [
  { value: "PLATFORM_ADMIN", label: "Platform Admin" },
  { value: "ADMIN",          label: "Admin" },
  { value: "CHAIRPERSON",    label: "Chairperson" },
  { value: "FINANCE",        label: "Finance" },
  { value: "DEPARTMENT_HEAD",label: "Dept Head" },
  { value: "MEMBER",         label: "Member" },
] as const;

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

type Org = {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  logoInitials: string;
};


interface ViewFormProps {
  user: AdminUser;
  onEdit: () => void;
  onClose: () => void;
}

function ViewForm({ user, onEdit, onClose }: ViewFormProps) {
  return (
    <>
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
        <Button size="sm" onClick={onEdit}>
          <Pencil size={12} /> Edit
        </Button>
      </DialogFooter>
    </>
  );
}

interface EditFormProps {
  user: AdminUser;
  organizations: Org[];
  defaultEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function EditForm({ user, organizations, defaultEditing, onClose, onSaved }: EditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [membershipRoles, setMembershipRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(user.memberships.map((m) => [m.id, m.role.toUpperCase()]))
  );
  const [removingMembership, setRemovingMembership] = useState<string | null>(null);

  const [newOrgId, setNewOrgId] = useState("");
  const [newRole, setNewRole] = useState<string>("MEMBER");
  const [adding, setAdding] = useState(false);

  const existingOrgIds = new Set(user.memberships.map((m) => m.org.id));
  const availableOrgs = organizations.filter((o) => !existingOrgIds.has(o.id));

  const handleCancel = () => {
    if (defaultEditing) {
      onClose();
    } else {
      setName(user.name);
      setEmail(user.email);
      setError("");
      onSaved();
    }
  };

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }

    setSaving(true);
    const res = await updateUserAction(user.id, { name: name.trim(), email: email.trim() });
    setSaving(false);

    if ("error" in res) {
      setError(typeof res.error === "string" ? res.error : "Update failed");
      return;
    }

    onSaved();
    router.refresh();
  };

  const handleRoleChange = async (membershipId: string, role: string) => {
    setMembershipRoles((prev) => ({ ...prev, [membershipId]: role }));
    await updatePlatformMembershipAction(membershipId, { role });
    router.refresh();
  };

  const handleRemoveMembership = async () => {
    if (!removingMembership) return;
    await removePlatformMembershipAction(removingMembership);
    setRemovingMembership(null);
    router.refresh();
  };

  const handleAddMembership = async () => {
    if (!newOrgId) return;
    setAdding(true);
    await createPlatformMembershipAction({ userId: user.id, organizationId: newOrgId, role: newRole });
    setAdding(false);
    setNewOrgId("");
    setNewRole("MEMBER");
    router.refresh();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
      </DialogHeader>

      <DialogBody>
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[14px] text-danger"
          >
            {error}
          </div>
        )}

        <div>
          <p className="text-[13px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">
            Member Details
          </p>
          <div className="space-y-3">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">
            Memberships ({user.memberships.length})
          </p>
          <div className="space-y-2">
            {user.memberships.map((membership) => {
              const currentRole = membershipRoles[membership.id] ?? membership.role.toUpperCase();
              return (
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
                    <p className="text-[14px] font-medium mb-1">{membership.org.name}</p>
                    <Select
                      value={currentRole}
                      onValueChange={(v) => handleRoleChange(membership.id, v)}
                    >
                      <SelectTrigger className="h-7 text-[12px] py-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge variant={roleVariants[membership.role] ?? "draft"}>
                    {roleLabels[membership.role] ?? membership.role}
                  </Badge>
                  <button
                    onClick={() => setRemovingMembership(membership.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-(--muted) hover:text-(--danger) hover:bg-(--danger-bg) transition-colors shrink-0"
                    title="Remove from org"
                    type="button"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {availableOrgs.length > 0 && (
          <div>
            <p className="text-[13px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">
              Add Membership
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="block text-[13px] font-medium text-(--text)">Organisation</label>
                <Select value={newOrgId || "none"} onValueChange={(v) => setNewOrgId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organisation…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select organisation…</SelectItem>
                    {availableOrgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-36 space-y-1.5">
                <label className="block text-[13px] font-medium text-(--text)">Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddMembership}
                loading={adding}
                disabled={!newOrgId}
              >
                <Plus size={13} /> Add
              </Button>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </DialogFooter>

      <ConfirmDialog
        open={removingMembership !== null}
        title="Remove Membership"
        message="Are you sure you want to remove this user from the organisation?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveMembership}
        onCancel={() => setRemovingMembership(null)}
      />
    </>
  );
}


interface UserDetailModalProps {
  user: AdminUser;
  organizations: Org[];
  open: boolean;
  defaultEditing?: boolean;
  onClose: () => void;
}

export function UserDetailModal({
  user,
  organizations,
  open,
  onClose,
  defaultEditing = false,
}: Readonly<UserDetailModalProps>) {
  const [editing, setEditing] = useState(defaultEditing);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent aria-label={user.name || "User"}>
        {editing ? (
          <EditForm
            user={user}
            organizations={organizations}
            defaultEditing={defaultEditing}
            onClose={onClose}
            onSaved={() => setEditing(false)}
          />
        ) : (
          <ViewForm
            user={user}
            onEdit={() => setEditing(true)}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
