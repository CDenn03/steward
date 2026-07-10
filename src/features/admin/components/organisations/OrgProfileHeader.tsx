import { Clock, Calendar, Edit3 } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { formatDate } from "@/lib/utils";

interface OrgProfileHeaderProps {
  name: string;
  slug: string;
  description: string;
  initials: string;
  timezone: string;
  createdAt: Date;
}

export function OrgProfileHeader({
  name,
  slug,
  description,
  initials,
  timezone,
  createdAt,
}: OrgProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 bg-white rounded-2xl mb-6">
      <div className="flex gap-3.5">
        <div className="w-13 h-13 rounded-full bg-linen flex items-center justify-center font-display font-semibold text-ink shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold text-ink">{name}</span>
            <span className="font-mono text-[13px] text-warmgray">/{slug}</span>
          </div>
          <p className="text-[14px] text-warmgray mt-1 max-w-105">{description}</p>
          <div className="flex gap-3.5 mt-2 text-[13px] text-warmgray">
            <span>
              <Clock size={14} className="inline align-[-2px] mr-1" aria-hidden />
              {timezone}
            </span>
            <span>
              <Calendar size={14} className="inline align-[-2px] mr-1" aria-hidden />
              Created {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <Edit3 size={13} className="mr-1.5" />
        Edit org details
      </Button>
    </div>
  );
}
