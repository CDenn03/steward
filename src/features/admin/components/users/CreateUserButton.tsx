"use client";

import { useState } from "react";

import { CreatePlatformUserModal } from "./CreateUserModal";
import { Button } from "@/components/ui/Button";


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