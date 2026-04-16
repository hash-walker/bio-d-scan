import { cn } from "@/lib/utils";
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "pale";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl p-5 transition-all duration-200",
        {
          "bg-white border border-[var(--border-subtle)] shadow-sm":
            variant === "default",
          "bg-[var(--green-deep)] text-white": variant === "dark",
          "bg-[var(--green-pale)]/40 border border-[var(--green-pale)]":
            variant === "pale",
        },
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-display font-bold text-lg leading-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

/**
 * CardActionHeader — a card header row with a title (+ optional icon) on the left
 * and any action element (link, button, badge) on the right.
 *
 * Replaces the repeated `<CardHeader><div className="flex justify-between">` pattern.
 */
function CardActionHeader({
  title,
  action,
  icon,
  titleSize = "base",
  className,
}: {
  title: string;
  action?: ReactNode;
  icon?: ReactNode;
  titleSize?: "base" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className={titleSize === "base" ? "text-base" : "text-lg"}>
          {title}
        </CardTitle>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardActionHeader };
