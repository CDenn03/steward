"use client";

import { useState } from "react";
import { Button } from '@/components/ui/Button';
import { formatDate } from "@/lib/utils";
import OrganisationModal from "./OrganisationModal";

interface OrgProfileHeaderProps {
  organizationId: string;
  name: string;
  description: string;
  initials: string;
  timezone: string;
  logoUrl: string | null;
}

export function OrgProfileHeader({
  organizationId,
  name,
  description,
  initials,
  timezone,
  logoUrl,
}: Readonly<OrgProfileHeaderProps>) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-4 p-6 bg-(--surface) border border-(--border) rounded-2xl mb-5">
        <div className="flex gap-4 items-center">
          <div className="w-13 h-13 rounded-full bg-(--bg) border border-(--border) flex items-center justify-center font-display font-semibold text-(--text) shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[19px] font-semibold text-(--text)">{name}</span>
            </div>
            {description ? (
              <p className="text-[13px] text-(--muted) italic mt-1 max-w-prose">{description}</p>
            ) : (
              <p className="text-[13px] text-(--muted) italic mt-1">No description added</p>
            )}
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
