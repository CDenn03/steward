"use client";

import { GitBranch, Plus, Edit3, Archive, RotateCcw } from "lucide-react";
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
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="m-0 text-[15px] font-medium flex items-center gap-1.5">
          <GitBranch size={18} className="text-(--muted)" aria-hidden />
          Departments
        </h3>
        <Button variant="ghost" size="sm">
          <Plus size={13} className="mr-1.5" />
          New department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {departments.map((d) => (
          <DepartmentCard key={d.id} department={d} />
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-8 text-center text-[13px] text-(--muted)">
            No departments yet.
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentCard({ department: d }: { department: Department }) {
  return (
    <div className="bg-(--surface) border-[0.5px] border-(--border) rounded-xl p-4">
      <div className="flex justify-between items-start">
        <p className="font-medium m-0">{d.name}</p>
        <span
          className={`inline-block rounded-(--r-card) px-2 py-0.5 text-[11px] ${
            d.isActive
              ? "bg-green-100 text-green-700"
              : "bg-(--surface) text-(--muted)"
          }`}
        >
          {d.isActive ? "Active" : "Archived"}
        </span>
      </div>
      <p className="text-[13px] text-(--muted) mt-1.5 mb-0">{d.description ?? "—"}</p>
      <p className="text-[12px] text-(--muted) mt-2 mb-2.5">
        Head: {d.head?.name ?? "—"} &middot; {d.memberCount} member{d.memberCount !== 1 ? "s" : ""}
      </p>
      <div className="flex gap-2 border-t-[0.5px] border-(--border) pt-2">
        <Button variant="ghost" size="sm" className="flex-1">
          <Edit3 size={13} className="mr-1" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          {d.isActive ? (
            <><Archive size={13} className="mr-1" /> Archive</>
          ) : (
            <><RotateCcw size={13} className="mr-1" /> Restore</>
          )}
        </Button>
      </div>
    </div>
  );
}
