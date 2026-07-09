"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import {
  updateUserAction,
  updatePlatformMembershipAction,
  removePlatformMembershipAction,
  createPlatformMembershipAction,
} from "@/features/admin/actions";
import type { AdminUser } from "@/features/admin/repositories";

const ROLE_OPTIONS = ["PLATFORM_ADMIN", "ADMIN", "CHAIRPERSON", "FINANCE", "DEPARTMENT_HEAD", "MEMBER"] as const;

const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  admin: "Admin",
  chairperson: "Chairperson",
  finance: "Finance",
  department_head: "Dept Head",
  member: "Member",
};

const roleVariants: Record<string, "default" | "info" | "success" | "gold" | "warning" | "draft"> = {
  platform_admin: "info",
  admin: "info",
  chairperson: "default",
  finance: "success",
  department_head: "gold",
  member: "draft",
};

type Org = { id: string; name: string; slug: string; primaryColor: string; logoInitials: string };

type UserForm = {
  name: string;
  email: string;
};

type AddMembershipForm = {
  organizationId: string;
  role: string;
};

interface UserDetailModalProps {
  user: AdminUser;
  organizations: Org[];
  open: boolean;
  defaultEditing?: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, organizations, open, onClose, defaultEditing = false }: Readonly<UserDetailModalProps>) {
  const router = useRouter();
  const [editing, setEditing] = useState(defaultEditing);

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const {
    register: registerMembership,
    handleSubmit: handleMembershipSubmit,
    reset: resetMembership,
    watch,
    formState: {
      isSubmitting: isAddingMembership,
      errors: membershipErrors,
    },
  } = useForm<AddMembershipForm>({
    defaultValues: {
      organizationId: "",
      role: "MEMBER",
    },
  });

  const [membershipRoles, setMembershipRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(user.memberships.map((m) => [m.id, m.role.toUpperCase()]))
  );
  const [removingMembership, setRemovingMembership] = useState<string | null>(null);


  const [adding, setAdding] = useState(false);

  const existingOrgIds = new Set(user.memberships.map((m) => m.org.id));
  const availableOrgs = organizations.filter((o) => !existingOrgIds.has(o.id));


  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
    });
  }, [user, reset]);

  const handleCancel = () => {
    if (defaultEditing) {
      onClose();
    } else {
      setEditing(false);

      reset({
        name: user.name,
        email: user.email,
      });

      setError("");
    }
  };


  const handleSave = async (data: UserForm) => {
    setError("");

    const res = await updateUserAction(user.id, {
      name: data.name.trim(),
      email: data.email.trim(),
    });

    if ("error" in res) {
      setError(typeof res.error === "string" ? res.error : "Update failed");
      return;
    }

    setEditing(false);
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

  const handleAddMembership = async (data: AddMembershipForm) => {
    await createPlatformMembershipAction({
      userId: user.id,
      organizationId: data.organizationId,
      role: data.role,
    });

    resetMembership();

    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent aria-label={user.name}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[12px] font-semibold text-(--primary)">
              {user.initials}
            </div>
            <div>
              <DialogTitle>{user.name}</DialogTitle>
              <p className="text-[11px] text-(--muted)">{user.email}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSave)}>

          <DialogBody>
            {error && (
              <div className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">{error}</div>
            )}

            <div>
              <p className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">Account Details</p>
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium mb-1">
                      Name
                    </label>

                    <input
                      type="text"
                      {...register("name", {
                        required: "Name is required",
                      })}
                      className="w-full px-3 py-2 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                    />

                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium mb-1">
                      Email
                    </label>

                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                      className="w-full px-3 py-2 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                    />

                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="text-(--muted) w-16">Name</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="text-(--muted) w-16">Email</span>
                    <span>{user.email}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">
                Memberships ({user.memberships.length})
              </p>
              <div className="space-y-2">
                {user.memberships.map((membership) => {
                  const currentRole = membershipRoles[membership.id] ?? membership.role.toUpperCase();
                  return (
                    <div key={membership.id} className="flex items-center gap-3 bg-(--bg) border border-(--border) rounded-[10px] px-3.5 py-3">
                      <div
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: membership.org.primaryColor }}
                      >
                        {membership.org.logoInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{membership.org.name}</p>
                        {editing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <select
                              value={currentRole}
                              onChange={(e) => handleRoleChange(membership.id, e.target.value)}
                              className="px-2 py-1 text-[11px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text)"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>{roleLabels[r.toLowerCase()] ?? r}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p className="text-[11px] text-(--muted)">{roleLabels[membership.role] ?? membership.role}</p>
                        )}
                      </div>
                      <Badge variant={roleVariants[membership.role] ?? "draft"}>
                        {roleLabels[membership.role] ?? membership.role}
                      </Badge>
                      {editing && (
                        <button
                          onClick={() => setRemovingMembership(membership.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-(--muted) hover:text-danger hover:bg-danger-bg transition-colors shrink-0"
                          title="Remove from org"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {editing && availableOrgs.length > 0 && (
              <form onSubmit={handleMembershipSubmit(handleAddMembership)}>
                <div>
                  <p className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-3">Add Membership</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium mb-1">Organisation</label>
                      <select
                        {...registerMembership("organizationId", {
                          required: "Please select an organisation",
                        })}
                        className="w-full px-3 py-2 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                      >
                        {membershipErrors.organizationId && (
                          <p className="mt-1 text-xs text-red-500">
                            {membershipErrors.organizationId.message}
                          </p>
                        )}
                        <option value="">Select organisation…</option>
                        {availableOrgs.map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-36">
                      <label className="block text-[12px] font-medium mb-1">Role</label>
                      <select
                        {...registerMembership("role")}
                        className="w-full px-3 py-2 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{roleLabels[r.toLowerCase()] ?? r}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      loading={isAddingMembership}
                      disabled={!watch("organizationId")}
                    >
                      <Plus size={13} /> Add
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </DialogBody>

          <DialogFooter>
            {editing ? (
              <>
                <Button variant="ghost" size="sm" type="button" onClick={handleCancel} disabled={isSubmitting}>
                  {defaultEditing ? "Cancel" : "Cancel"}
                </Button>
                <Button size="sm" type="submit" loading={isSubmitting}>Save Changes</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" type="button" onClick={onClose}>Close</Button>
                <Button size="sm" onClick={() => setEditing(true)}>
                  <Edit2 size={12} /> Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
        <ConfirmDialog
          open={removingMembership !== null}
          title="Remove Membership"
          message="Are you sure you want to remove this user from the organisation?"
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleRemoveMembership}
          onCancel={() => setRemovingMembership(null)}
        />
      </DialogContent>
    </Dialog>
  );
}
