"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { markAllReadAction } from "@/features/notifications/actions";

export function MarkAllReadButton() {
  const router = useRouter();

  const handleClick = async () => {
    await markAllReadAction();
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      <CheckCheck size={13} /> Mark all read
    </Button>
  );
}
