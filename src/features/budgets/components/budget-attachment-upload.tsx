"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import { getBudgetUploadUrlAction, saveBudgetAttachmentAction } from "../actions";

type Attachment = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
};

export function BudgetAttachmentUpload({
  budgetId,
  attachments,
}: {
  budgetId: string;
  attachments: Attachment[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const urlRes = await getBudgetUploadUrlAction(file.name, file.type, budgetId);
      const urlError = "error" in urlRes ? urlRes.error : null;
      if (urlError) {
        setError(typeof urlError === "string" ? urlError : (urlError as { message?: string })?.message ?? "Failed to get upload URL");
        return;
      }

      const { storageKey, uploadUrl } = (urlRes as { data: { storageKey: string; uploadUrl: string } }).data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        setError("Upload failed");
        return;
      }

      const saveRes = await saveBudgetAttachmentAction({
        storageKey,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        budgetId,
      });

      const saveError = "error" in saveRes ? saveRes.error : null;
      if (saveError) {
        setError(typeof saveError === "string" ? saveError : (saveError as { message?: string })?.message ?? "Failed to save attachment");
        return;
      }

      router.refresh();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="divide-y divide-(--border)">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-(--primary)">
              <Paperclip size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{attachment.fileName}</p>
              <p className="text-[11px] text-(--muted)">{attachment.mimeType} · {Math.ceil(attachment.size / 1024)} KB</p>
            </div>
            <span className="text-[11px] text-(--muted)">{formatRelative(attachment.createdAt)}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-(--border)">
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
        >
          <Upload size={13} /> Upload File
        </Button>
        {error && <p className="text-[11px] text-danger mt-1">{error}</p>}
      </div>
    </div>
  );
}