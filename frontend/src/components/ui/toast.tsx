"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ToastProps {
  show: boolean;
  message: string;
  icon?: LucideIcon;
  variant?: "green" | "amber" | "red";
}

const VARIANT_CLASSES = {
  green: "bg-[var(--green-deep)] text-white",
  amber: "bg-[var(--amber-deep)] text-white",
  red: "bg-red-600 text-white",
};

/**
 * Toast — fixed bottom-center notification.
 * Identical implementation extracted from credits-page and analytics-page.
 */
export function Toast({
  show,
  message,
  icon: Icon = CheckCircle2,
  variant = "green",
}: ToastProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-sm font-medium z-50",
        VARIANT_CLASSES[variant]
      )}
    >
      <Icon size={16} />
      {message}
    </div>
  );
}
