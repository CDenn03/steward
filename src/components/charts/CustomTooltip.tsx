import { formatCurrency } from "@/lib/utils";

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  currency?: boolean;
}

export function CustomTooltip({ active, payload, label, currency = true }: Readonly<CustomTooltipProps>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-(--surface) border border-(--border) rounded-[10px] px-3 py-2.5 shadow-lg text-[13px] min-w-[140px]">
      {label && <p className="font-medium text-(--text) mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {entry.color && (
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: entry.color }} />
            )}
            <span className="text-(--muted)">{entry.name}</span>
          </div>
          <span className="font-mono font-medium text-(--text)">
            {currency ? formatCurrency(entry.value, "KES", true) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
