"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
  accept: string;
  label: string;
  description?: string;
  currentUrl?: string | null;
  onStarted?: () => void;
  onCompleted?: (storageKey: string) => void;
  onError?: (message: string) => void;
  getUploadUrl: (fileName: string, mimeType: string) => Promise<{
    data?: { storageKey: string; uploadUrl: string };
    error?: { message: string };
  }>;
  saveKey: (storageKey: string) => Promise<{
    success?: boolean;
    error?: unknown;
  }>;
}

export function FileUpload({
  accept,
  label,
  description,
  currentUrl,
  onStarted,
  onCompleted,
  onError,
  getUploadUrl,
  saveKey,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onError?.("File exceeds 10 MB limit");
      return;
    }

    setUploading(true);
    onStarted?.();

    try {
      const urlRes = await getUploadUrl(file.name, file.type);
      if (urlRes.error) {
        onError?.(urlRes.error.message);
        setUploading(false);
        return;
      }

      const { storageKey, uploadUrl } = urlRes.data!;
      await fetch(uploadUrl, { method: "PUT", body: file });
      const saveRes = await saveKey(storageKey);
      if (saveRes.error) {
        onError?.("Failed to save file reference");
      } else {
        onCompleted?.(storageKey);
      }
    } catch {
      onError?.("Upload failed");
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
        aria-label={label}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium rounded-(--r-btn) border border-(--border) bg-(--surface) hover:bg-(--bg) transition-colors disabled:opacity-50"
        aria-label={uploading ? `Uploading ${label}` : `Upload ${label}`}
      >
        <Upload size={12} />
        {uploading ? "Uploading…" : label}
      </button>
      {description && (
        <p className="text-[11px] text-(--muted) mt-1">{description}</p>
      )}
    </div>
  );
}
