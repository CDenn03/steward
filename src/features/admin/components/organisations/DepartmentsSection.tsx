"use client";

import { Plus, Edit3, Archive, RotateCcw } from "lucide-react";
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
      <div className="flex justify-between items-center pb-2.5">
        <p className="text-[12px] font-semibold text-(--muted) uppercase tracking-[0.03em] mb-2.5">Departments</p>
        <div className="flex items-center mb-2.5">
          <Button variant="ghost" size="sm">
            <Plus size={13} className="mr-1.5" />
            New department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {departments.map((d) => (
          <DepartmentCard key={d.id} department={d} />
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-8 text-center text-[14px] text-warmgray">
            No departments yet.
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentCard({ department: d }: { department: Department }) {
  return (
    <div className="bg-white border border-linen rounded-2xl p-4">
      <div className="flex justify-between items-start">
        <p className="font-display font-semibold text-ink m-0">{d.name}</p>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold ${
            d.isActive
              ? "bg-moss-light text-moss"
              : "bg-linen text-warmgray"
          }`}
        >
          {d.isActive ? "Active" : "Archived"}
        </span>
      </div>
      <p className="text-xs text-warmgray mt-1.5 mb-0">{d.description ?? "—"}</p>
      <p className="text-xs text-warmgray mt-2 mb-2.5">
        Head: {d.head?.name ?? "—"} &middot; {d.memberCount} member{d.memberCount !== 1 ? "s" : ""}
      </p>
      <div className="flex gap-2 border-t border-linen pt-2">
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
