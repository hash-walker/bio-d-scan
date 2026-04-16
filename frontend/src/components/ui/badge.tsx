import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "amber" | "blue" | "red" | "gray" | "outline";
}

export function Badge({ className, variant = "green", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[var(--green-pale)] text-[var(--green-deep)]": variant === "green",
          "bg-amber-100 text-amber-800": variant === "amber",
          "bg-blue-100 text-blue-700": variant === "blue",
          "bg-red-100 text-red-700": variant === "red",
          "bg-[var(--border-subtle)] text-[var(--text-muted)]": variant === "gray",
          "border border-[var(--green-deep)] text-[var(--green-deep)] bg-transparent":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
