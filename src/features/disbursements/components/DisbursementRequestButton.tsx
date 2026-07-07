"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { RequestDisbursementModal } from './RequestDisbursementModal';

type AccountOption = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
};

export function DisbursementRequestButton({
  budgetId,
  accounts,
}: {
  budgetId: string;
  accounts: AccountOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <DollarSign size={13} /> Request Disbursement
      </Button>
      {open && (
        <RequestDisbursementModal
          budgetId={budgetId}
          accounts={accounts}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}