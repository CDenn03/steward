"use client";

import { useState } from "react";
import { Button } from '@/components/ui/Button';
import { formatDate } from "@/lib/utils";
import OrganisationModal from "./OrganisationModal";

interface OrgProfileHeaderProps {
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  initials: string;
  timezone: string;
  logoUrl: string | null;
  createdAt: Date;
}

export function OrgProfileHeader({
  organizationId,
  name,
  slug,
  description,
  initials,
  timezone,
  logoUrl,
  createdAt,
}: OrgProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-4 p-6 bg-white border border-(--border) rounded-2xl mb-5">
        <div className="flex gap-4 items-center">
          <div className="w-13 h-13 rounded-full bg-linen flex items-center justify-center font-display font-semibold text-ink shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[19px] font-semibold text-ink">{name}</span>
              <span className="font-mono text-[13px] text-(--muted)">/{slug}</span>
            </div>
            {description ? (
              <p className="text-[13px] text-(--muted) italic mt-1 max-w-prose">{description}</p>
            ) : (
              <p className="text-[13px] text-[#B3B0A5] italic mt-1">No description added</p>
            )}
            <div className="flex gap-4 mt-2 text-[13px] text-(--muted)">
              <span>Timezone: {timezone}</span>
              <span>Created {formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setEditOpen(true)}>
          Edit org details
        </Button>
      </div>

      <OrganisationModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        organizationId={organizationId}
        initialData={{ name, description, logoUrl, timezone }}
      />
    </>
  );
}
