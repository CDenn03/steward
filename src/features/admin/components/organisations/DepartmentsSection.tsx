"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import DepartmentModal from "./DepartmentModal";
import { updateDepartmentAction, deleteDepartmentAction } from "@/features/admin/actions";

type Department = {
  id: string;
  name: string;
  description: string | null;
  head: { id: string; name: string } | null;
  isActive: boolean;
  memberCount: number;
};

interface DepartmentsSectionProps {
  organizationId: string;
  departments: Department[];
}

export function DepartmentsSection({ organizationId, departments }: Readonly<DepartmentsSectionProps>) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleArchiveConfirm = () => {
    if (!archiveTarget) return;
    const { id, isActive } = archiveTarget;
    startTransition(async () => {
      await updateDepartmentAction(id, organizationId, { isActive: !isActive });
      setArchiveTarget(null);
      router.refresh();
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    startTransition(async () => {
      await deleteDepartmentAction(id, organizationId);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="mb-9">
      <div className="flex justify-between items-center mb-3.5">
        <p className="text-[13px] font-semibold text-(--text) uppercase tracking-wider">
          Departments
        </p>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={13} className="mr-1.5" />
          New department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {departments.map((d) => (
          <DepartmentCard
            key={d.id}
            department={d}
            onEdit={() => setEditTarget(d)}
            onToggleActive={() => setArchiveTarget(d)}
            onDelete={() => setDeleteTarget(d)}
          />
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-8 text-center text-[14px] text-(--muted)">
            No departments yet.
          </div>
        )}
      </div>

      <DepartmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="add"
        organizationId={organizationId}
      />

      <DepartmentModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        mode="edit"
        organizationId={organizationId}
        departmentId={editTarget?.id}
        initialData={
          editTarget
            ? { name: editTarget.name, description: editTarget.description }
            : undefined
        }
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        title={archiveTarget?.isActive ? "Archive Department" : "Restore Department"}
        message={
          archiveTarget?.isActive
            ? `Archive "${archiveTarget.name}"? Members will remain but the department will be inactive.`
            : `Restore "${archiveTarget?.name}"? The department will become active again.`
        }
        confirmLabel={archiveTarget?.isActive ? "Archive" : "Restore"}
        variant={archiveTarget?.isActive ? "warning" : "confirm"}
        loading={isPending}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Department"
        message={
          deleteTarget
            ? deleteTarget.memberCount > 0
              ? `Permanently delete "${deleteTarget.name}"? ${deleteTarget.memberCount} member${deleteTarget.memberCount !== 1 ? "s" : ""} will be unassigned from this department. This cannot be undone.`
              : `Permanently delete "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        loading={isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

interface DepartmentCardProps {
  department: Department;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

function DepartmentCard({ department: d, onEdit, onToggleActive, onDelete }: Readonly<DepartmentCardProps>) {
  const isUnstaffed = d.isActive && !d.head;
  const badgeLabel = !d.isActive ? "Archived" : isUnstaffed ? "Unstaffed" : "Active";
  const badgeClass = !d.isActive
    ? "bg-linen text-(--muted)"
    : isUnstaffed
    ? "bg-[#F1EAE0] text-[#A6672E]"
    : "bg-linen text-[#4B6650]";

  return (
    <div className="bg-white border border-(--border) rounded-2xl px-5 py-4.5">
      <div className="flex justify-between items-start mb-2.5">
        <p className="font-semibold text-[15px] text-ink">{d.name}</p>
        <span
          className={`${badgeClass} text-[11px] font-medium px-2.5 py-0.75 rounded-full whitespace-nowrap`}
        >
          {badgeLabel}
        </span>
      </div>

      {d.description ? (
        <p className="text-[13px] text-(--muted) italic mb-3">{d.description}</p>
      ) : (
        <p className="text-[13px] text-[#B3B0A5] italic mb-3">No description added</p>
      )}

      <p className="text-[13px] text-(--muted) pb-3.5 mb-3.5 border-b border-(--border)">
        Head:{" "}
        <span className="font-medium text-ink">{d.head?.name ?? "Not assigned"}</span>
        {" · "}
        {d.memberCount} member{d.memberCount !== 1 ? "s" : ""}
      </p>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center"
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center"
          onClick={onToggleActive}
        >
          {d.isActive ? "Archive" : "Restore"}
        </Button>
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-md text-(--muted) hover:text-(--danger) hover:bg-(--danger-bg) transition-colors shrink-0 cursor-pointer"
          title="Delete department"
          type="button"
          aria-label={`Delete ${d.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
