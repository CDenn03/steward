"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAccountModal } from "@/features/accounts/components/add-account-modal";

export function AddAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Add Account
      </Button>
      <AddAccountModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}