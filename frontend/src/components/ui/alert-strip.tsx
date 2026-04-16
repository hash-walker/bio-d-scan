import type { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "amber" | "red" | "green" | "blue";

const VARIANT_STYLES: Record<AlertVariant, { wrapper: string; icon: string; text: string; IconComponent: React.ElementType }> = {
  amber: {
    wrapper: "bg-amber-50/80 border border-amber-200/60",
    icon: "text-amber-600",
    text: "text-amber-700",
    IconComponent: AlertTriangle,
  },
  red: {
    wrapper: "bg-red-50/80 border border-red-200/60",
    icon: "text-red-600",
    text: "text-red-700",
    IconComponent: XCircle,
  },
  green: {
    wrapper: "bg-[var(--green-pale)]/60 border border-[var(--green-light)]/30",
    icon: "text-[var(--green-deep)]",
    text: "text-[var(--green-deep)]",
    IconComponent: CheckCircle2,
  },
  blue: {
    wrapper: "bg-blue-50/80 border border-blue-200/60",
    icon: "text-blue-600",
    text: "text-blue-700",
    IconComponent: Info,
  },
};

interface AlertStripProps {
  message: ReactNode;
  variant?: AlertVariant;
  /** Replace the default icon */
  icon?: React.ElementType;
  className?: string;
}

/**
 * AlertStrip — a compact inline warning/info banner.
 * Used for zone health warnings in analytics and dry-spell alerts in the gov dashboard.
 */
export function AlertStrip({
  message,
  variant = "amber",
  icon: CustomIcon,
  className,
}: AlertStripProps) {
  const { wrapper, icon: iconClass, text, IconComponent } = VARIANT_STYLES[variant];
  const Icon = CustomIcon ?? IconComponent;

  return (
    <div className={cn("flex items-start gap-2 rounded-xl p-3", wrapper, className)}>
      <Icon size={14} className={cn("mt-0.5 shrink-0", iconClass)} />
      <p className={cn("text-xs leading-relaxed", text)}>{message}</p>
    </div>
  );
}
