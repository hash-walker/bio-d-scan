"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bug,
  Star,
  Archive,
  ScanLine,
  Users,
  BarChart3,
  FileText,
  Plus,
  type LucideIcon,
} from "lucide-react";

// All icons resolved by name-string so layouts (Server Components) can pass
// plain serialisable data to this Client Component.
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Bug,
  Star,
  Archive,
  ScanLine,
  Users,
  BarChart3,
  FileText,
  Plus,
};

export interface NavItem {
  href: string;
  label: string;
  iconName: string;
}

interface SidebarProps {
  navItems: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
  ctaIconName?: string;
  userLabel?: string;
  userSub?: string;
  portalLabel?: string;
  portalSub?: string;
}

export function Sidebar({
  navItems,
  ctaHref,
  ctaLabel,
  ctaIconName,
  userLabel,
  userSub,
  portalLabel = "Bio D. Scan",
  portalSub,
}: SidebarProps) {
  const pathname = usePathname();
  const CtaIcon = ctaIconName ? ICON_MAP[ctaIconName] : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 flex flex-col bg-[var(--bg-cream)] border-r border-[var(--border-subtle)] z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--green-deep)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">BD</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--green-deep)] leading-tight">
              {portalLabel}
            </p>
            {portalSub && (
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
                {portalSub}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User card */}
      {userLabel && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-[var(--green-pale)]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--green-mid)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userLabel.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-dark)] truncate">
                {userLabel}
              </p>
              {userSub && (
                <p className="text-xs text-[var(--text-muted)] truncate">{userSub}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, iconName }) => {
          const Icon = ICON_MAP[iconName];
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[var(--green-deep)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--green-pale)]/40 hover:text-[var(--green-deep)]"
              )}
            >
              {Icon && <Icon size={16} className="shrink-0" />}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* CTA button */}
      {ctaHref && ctaLabel && (
        <div className="px-3 pb-5">
          <Link
            href={ctaHref}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[var(--green-deep)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors"
          >
            {CtaIcon && <CtaIcon size={15} />}
            {ctaLabel}
          </Link>
        </div>
      )}
    </aside>
  );
}
