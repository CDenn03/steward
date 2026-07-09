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
    <div className="flex items-start justify-between gap-4 p-5 bg-(--surface) rounded-(--r-card) mb-6">
      <div className="flex gap-3.5">
        <div className="w-14 h-14 rounded-xl bg-(--bg-accent) flex items-center justify-center font-medium text-[18px] text-(--primary) shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-medium text-(--text)">{name}</span>
            <span className="font-mono text-[12px] text-(--muted)">/{slug}</span>
          </div>
          <p className="text-[13px] text-(--muted) mt-1 max-w-105">{description}</p>
          <div className="flex gap-3.5 mt-2 text-[12px] text-(--muted)">
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
