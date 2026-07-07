"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddOrganizationModal from "@/features/admin/components/AddOrganisationModal";

export function OnboardOrgButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Onboard Organisation
      </Button>
      <AddOrganizationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
