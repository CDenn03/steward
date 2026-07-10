"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';
import OrganisationModal from "@/features/admin/components/organisations/OrganisationModal";

export function OnboardOrgButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Onboard Organisation
      </Button>
      <OrganisationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
