import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";

interface ListRowProps {
  /** Leading element: emoji tile, avatar circle, icon circle */
  leading: ReactNode;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  /** Trailing element: badge, amount, chevron */
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * ListRow — a consistent row layout used in capture lists, transaction histories,
 * farmer lists, and anywhere else a leading icon + two-line text + trailing element appears.
 */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className,
}: ListRowProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement & HTMLDivElement>}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors w-full text-left",
        onClick
          ? "hover:bg-[var(--bg-cream)]/40 cursor-pointer"
          : "hover:bg-[var(--bg-cream)]/40",
        className
      )}
    >
      <div className="shrink-0">{leading}</div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-dark)] truncate">{title}</div>
        {subtitle && (
          <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">{subtitle}</div>
        )}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </Tag>
  );
}

/** Reusable emoji tile used as the leading element in capture rows */
export function EmojiTile({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-xl bg-[var(--green-pale)]/60 flex items-center justify-center text-base",
        className
      )}
    >
      {emoji}
    </div>
  );
}

/** Reusable icon circle used as the leading element in transaction / credit rows */
export function IconCircle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}
