import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  /** Override background + text color. Defaults to green-mid / white. */
  className?: string;
}

/**
 * Avatar — a circular initial badge. Used in the sidebar user card,
 * farmer cards, government overview table, and analytics distribution grid.
 */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-[var(--green-mid)] text-white flex items-center justify-center font-bold shrink-0",
        SIZE_CLASSES[size],
        className
      )}
      aria-label={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
