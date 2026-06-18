"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordIncomeModal } from "@/features/income/components/record-income-modal";

type AccountOption = { id: string; name: string; balance: number };
type FormOption = { id: string; name: string };

export function RecordIncomeActionButton({
  accounts,
  departments,
  events,
}: {
  accounts: AccountOption[];
  departments: FormOption[];
  events: FormOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Record Income
      </Button>
      <RecordIncomeModal
        open={open}
        onClose={() => setOpen(false)}
        accounts={accounts}
        departments={departments}
        events={events}
      />
    </>
  );
}