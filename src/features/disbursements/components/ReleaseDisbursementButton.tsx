"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { releaseDisbursementAction } from "../actions";

export function ReleaseDisbursementButton({ disbursementId }: { disbursementId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRelease = async () => {
    setLoading(true);
    setError("");
    const res = await releaseDisbursementAction({ disbursementId });
    const resError = "error" in res ? res.error : null;
    if (resError) {
      setError(typeof resError === "string" ? resError : (resError as { message?: string })?.message ?? "Release failed");
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div>
      <Button size="sm" onClick={handleRelease} loading={loading}>
        <CheckCircle2 size={13} /> Release Funds
      </Button>
      {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
    </div>
  );
}