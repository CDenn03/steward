"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreatePlatformUserModal } from "./create-user-modal";


interface Props {
  organizations: {
    id: string;
    name: string;
  }[];
}
export function CreateUserButton({organizations,}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
      >
        + New User
      </Button>
      <CreatePlatformUserModal
        open={open}
        onOpenChange={setOpen}
        organizations={organizations}

      />
    </>
  );
}