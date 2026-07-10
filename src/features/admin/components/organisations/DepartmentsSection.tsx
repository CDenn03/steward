"use client";

import { Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';

type Department = {
  id: string;
  name: string;
  description: string | null;
  head: { id: string; name: string } | null;
  isActive: boolean;
  memberCount: number;
};

interface DepartmentsSectionProps {
  departments: Department[];
}

export function DepartmentsSection({ departments }: DepartmentsSectionProps) {
  return (
    <div className="mb-9">
      <div className="flex justify-between items-center mb-3.5">
        <p className="text-[13px] font-semibold text-(--text) uppercase tracking-wider">Departments</p>
        <Button variant="primary" size="sm">
          <Plus size={13} className="mr-1.5" />
          New department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {departments.map((d) => (
          <DepartmentCard key={d.id} department={d} />
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-8 text-center text-[14px] text-(--muted)">
            No departments yet.
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentCard({ department: d }: { department: Department }) {
  // "Unstaffed" = active but no head assigned; "Active" = active with a head
  const isUnstaffed = d.isActive && !d.head;
  const badgeLabel = !d.isActive ? "Archived" : isUnstaffed ? "Unstaffed" : "Active";
  const badgeClass = !d.isActive
    ? "bg-linen text-(--muted)"
    : isUnstaffed
    ? "bg-[#F1EAE0] text-[#A6672E]"
    : "bg-linen text-[#4B6650]";

  return (
    <div className="bg-white border border-(--border) rounded-2xl px-5 py-[18px]">
      {/* Top row: name + badge */}
      <div className="flex justify-between items-start mb-2.5">
        <p className="font-semibold text-[15px] text-ink">{d.name}</p>
        <span className={`${badgeClass} text-[11px] font-medium px-2.5 py-[3px] rounded-full whitespace-nowrap`}>
          {badgeLabel}
        </span>
      </div>

      {/* Description */}
      {d.description ? (
        <p className="text-[13px] text-(--muted) italic mb-3">{d.description}</p>
      ) : (
        <p className="text-[13px] text-[#B3B0A5] italic mb-3">No description added</p>
      )}

      {/* Head + member count, with border-bottom before actions */}
      <p className="text-[13px] text-(--muted) pb-3.5 mb-3.5 border-b border-(--border)">
        Head:{" "}
        <span className="font-medium text-ink">{d.head?.name ?? "Not assigned"}</span>
        {" · "}
        {d.memberCount} member{d.memberCount !== 1 ? "s" : ""}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1 justify-center">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 justify-center">
          {d.isActive ? "Archive" : "Restore"}
        </Button>
      </div>
    </div>
  );
}
