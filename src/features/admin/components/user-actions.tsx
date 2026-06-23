"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, X, Check } from "lucide-react";
import { removeMembershipAction, updateMembershipAction } from "@/features/admin/actions";

const roleOptions = ["ADMIN", "FINANCE", "CHAIRPERSON", "DEPARTMENT_HEAD", "MEMBER"];

export function UserActions({
  membershipId,
  currentRole,
  currentDeptId,
  departments,
}: Readonly<{
  membershipId: string;
  currentRole: string;
  currentDeptId: string | null;
  departments: Array<{ id: string; name: string }>;
}>) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(currentRole);
  const [departmentId, setDepartmentId] = useState(currentDeptId ?? "");
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setEditing(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-(--muted) hover:text-(--text) hover:bg-(--bg) transition-colors"
          title="Edit membership"
        >
          <Edit2 size={11} />
        </button>
        <button
          onClick={async () => {
            if (!globalThis.confirm("Remove this user from the organisation?")) return;
            await removeMembershipAction(membershipId);
            router.refresh();
          }}
          className="w-6 h-6 flex items-center justify-center rounded-md text-(--muted) hover:text-danger hover:bg-danger-bg transition-colors"
          title="Remove from org"
        >
          <Trash2 size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="px-2 py-1 text-[11px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text)"
      >
        {roleOptions.map((r) => (
          <option key={r} value={r}>{r.replace("_", " ")}</option>
        ))}
      </select>
      {departments.length > 0 && (
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="px-2 py-1 text-[11px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text)"
        >
          <option value="">No dept</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      )}
      <button
        onClick={async () => {
          setSaving(true);
          await updateMembershipAction(membershipId, {
            role: role.toUpperCase(),
            departmentId: departmentId || null,
          });
          setSaving(false);
          setEditing(false);
          router.refresh();
        }}
        disabled={saving}
        className="w-6 h-6 flex items-center justify-center rounded-md text-success hover:bg-success-bg transition-colors"
        title="Save"
      >
        <Check size={11} />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="w-6 h-6 flex items-center justify-center rounded-md text-(--muted) hover:text-(--text) hover:bg-(--bg) transition-colors"
        title="Cancel"
      >
        <X size={11} />
      </button>
    </div>
  );
}
