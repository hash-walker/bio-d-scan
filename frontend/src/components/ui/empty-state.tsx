import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — centered placeholder shown when a list or view has no data.
 * Accepts either an emoji or a Lucide icon as the visual anchor.
 */
export function EmptyState({
  emoji,
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {emoji && <div className="text-4xl mb-3">{emoji}</div>}
      {Icon && !emoji && (
        <div className="flex justify-center mb-3">
          <Icon size={40} className="text-[var(--text-light)]" />
        </div>
      )}
      <p className="font-medium text-[var(--text-dark)]">{title}</p>
      {description && (
        <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
