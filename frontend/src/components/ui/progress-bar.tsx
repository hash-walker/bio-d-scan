import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  color?: "green" | "amber" | "red";
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  trackClassName,
  color = "green",
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
          {label && <span>{label}</span>}
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn(
          "h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden",
          trackClassName
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", {
            "bg-[var(--green-deep)]": color === "green",
            "bg-[var(--amber-mid)]": color === "amber",
            "bg-[var(--alert-red)]": color === "red",
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
