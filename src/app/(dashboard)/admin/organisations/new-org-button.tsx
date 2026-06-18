"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewOrgModal } from "@/components/shared/new-org-modal";

export function NewOrgButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> New Organisation
      </Button>
      <NewOrgModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
