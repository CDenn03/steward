"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { NewEventModal } from '@/features/events/components/NewEventModal';

type FormOption = { id: string; name: string };

export function NewEventButton({ departments }: { departments: FormOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> New Event
      </Button>
      <NewEventModal open={open} onClose={() => setOpen(false)} departments={departments} />
    </>
  );
}