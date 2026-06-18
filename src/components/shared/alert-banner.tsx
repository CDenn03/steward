import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  type?: "info" | "warning" | "success" | "danger";
  children: React.ReactNode;
  className?: string;
}

const config = {
  info: { bg: "bg-info-bg border-blue-200", text: "text-info", Icon: Info },
  warning: { bg: "bg-warning-bg border-yellow-200", text: "text-warning", Icon: AlertTriangle },
  success: { bg: "bg-success-bg border-green-200", text: "text-success", Icon: CheckCircle2 },
  danger: { bg: "bg-danger-bg border-red-200", text: "text-danger", Icon: AlertCircle },
};

export function AlertBanner({ type = "info", children, className }: AlertBannerProps) {
  const { bg, text, Icon } = config[type];
  return (
    <div className={cn("flex items-center gap-2.5 border rounded-[var(--r-btn)] px-4 py-2.5 text-[12.5px]", bg, text, className)}>
      <Icon size={14} className="shrink-0" />
      <div>{children}</div>
    </div>
  );
}
