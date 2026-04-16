import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Tailwind color class for both icon and value, e.g. "text-[var(--green-deep)]" */
  color?: string;
  /** Optional sub-label beneath the value */
  sub?: string;
  /** "sm" = text-2xl  |  "md" = text-3xl (default) */
  size?: "sm" | "md";
  /** Extra content rendered below the value (e.g. a ProgressBar) */
  children?: ReactNode;
  className?: string;
}

/**
 * StatCard — the most-reused UI atom across the app.
 * Renders a Card with a muted label, a large metric value, an icon, and an optional sub-line.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-[var(--green-deep)]",
  sub,
  size = "md",
  children,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide leading-tight">
            {label}
          </p>
          <Icon size={15} className={cn("shrink-0 mt-0.5", color)} />
        </div>
        <p
          className={cn(
            "font-display font-bold leading-none",
            size === "sm" ? "text-2xl" : "text-3xl",
            color
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
