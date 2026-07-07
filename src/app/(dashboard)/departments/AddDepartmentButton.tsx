"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { AddDepartmentModal } from '@/features/departments/components/AddDepartmentModal';

type MemberOption = { id: string; name: string };

export function AddDepartmentButton({ members }: { members: MemberOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Add Department
      </Button>
      <AddDepartmentModal open={open} onClose={() => setOpen(false)} members={members} />
    </>
  );
}