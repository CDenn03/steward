"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';
import AddOrganizationModal from "@/features/admin/components/organisations/AddOrganisationModal";

export function NewOrgButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> New Organisation
      </Button>
      <AddOrganizationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
