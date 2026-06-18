"use client";

import { useState } from "react";
import { History, ChevronDown, ChevronRight } from "lucide-react";
import { formatRelative } from "@/lib/utils";

type Revision = {
  id: string;
  reason: string;
  snapshot: Record<string, unknown>;
  createdAt: Date;
};

export function BudgetRevisionHistory({ revisions }: { revisions: Revision[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (revisions.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[13px] text-(--muted)">
        <History size={20} className="mx-auto mb-2 opacity-50" />
        No revision history available
      </div>
    );
  }

  return (
    <div className="divide-y divide-(--border)">
      {revisions.map((rev) => {
        const isExpanded = expandedId === rev.id;
        return (
          <div key={rev.id} className="px-4 py-3">
            <button
              onClick={() => setExpandedId(isExpanded ? null : rev.id)}
              className="flex items-center gap-2 w-full text-left"
            >
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{rev.reason}</p>
                <p className="text-[11px] text-(--muted)">{formatRelative(rev.createdAt)}</p>
              </div>
            </button>
            {isExpanded && rev.snapshot && (
              <div className="mt-3 ml-5 bg-(--bg) border border-(--border) rounded-[10px] p-3">
                <pre className="text-[11px] font-mono text-(--muted) whitespace-pre-wrap overflow-x-auto max-h-60">
                  {JSON.stringify(rev.snapshot, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}