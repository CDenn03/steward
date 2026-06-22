"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportCsvButton({
  label = "Export",
  url,
  fileName,
}: Readonly<{
  label?: string;
  url: string;
  fileName?: string;
}>) {
  const handleExport = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName ?? `${url.replace(/\//g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* ignore */ }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleExport}>
      <Download size={13} /> {label}
    </Button>
  );
}
