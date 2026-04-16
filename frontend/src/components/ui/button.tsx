"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[var(--green-deep)] text-white hover:bg-[var(--green-mid)] active:scale-95":
              variant === "primary",
            "bg-[var(--amber-deep)] text-white hover:bg-[var(--amber-mid)] active:scale-95":
              variant === "secondary",
            "border border-[var(--green-deep)] text-[var(--green-deep)] bg-transparent hover:bg-[var(--green-pale)] active:scale-95":
              variant === "outline",
            "text-[var(--green-deep)] bg-transparent hover:bg-[var(--green-pale)] active:scale-95":
              variant === "ghost",
            "bg-[var(--alert-red)] text-white hover:opacity-90 active:scale-95":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-7 py-3.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
