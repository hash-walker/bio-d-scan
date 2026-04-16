import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Optional small uppercase eyebrow above the title */
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  /** Content rendered in the top-right area (buttons, stats, etc.) */
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — consistent top-of-page heading used across all farmer and government pages.
 * Supports an optional eyebrow label, subtitle, and an action slot on the right.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between flex-wrap gap-4", className)}>
      <div>
        {eyebrow && (
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display font-bold text-3xl text-[var(--green-deep)]">
          {title}
        </h1>
        {subtitle && (
          <div className="text-[var(--text-muted)] text-sm mt-1">{subtitle}</div>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
