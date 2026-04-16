"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, type LucideIcon } from "lucide-react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
  ctaIconName?: string;
  userLabel?: string;
  userSub?: string;
  portalLabel?: string;
  portalSub?: string;
}

// pathname and activeHref are passed from AppShell so both sidebar instances
// always share the exact same single source of truth — no divergence possible.
interface SidebarContentProps extends Omit<AppShellProps, "children"> {
  pathname: string;
  activeHref: string | null;
  onNavClick: (href: string) => void;
}

function SidebarContent({
  navItems,
  ctaHref,
  ctaLabel,
  ctaIconName,
  userLabel,
  userSub,
  portalLabel,
  portalSub,
  pathname,
  activeHref,
  onNavClick,
}: SidebarContentProps) {
  const CtaIcon = ctaIconName ? ICON_MAP[ctaIconName] : null;

  // Optimistic: if the user just clicked a link, show it as active immediately
  // before Next.js navigation commits. Falls back to pathname when activeHref
  // is null (cleared once pathname settles on the new route).
  const isActive = (href: string) => {
    if (activeHref !== null) return activeHref === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--green-deep)] flex items-center justify-center shrink-0">
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
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onNavClick(href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
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

      {/* CTA */}
      {ctaHref && ctaLabel && (
        <div className="px-3 pb-5">
          <Link
            href={ctaHref}
            onClick={() => onNavClick(ctaHref)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[var(--green-deep)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors"
          >
            {CtaIcon && <CtaIcon size={15} />}
            {ctaLabel}
          </Link>
        </div>
      )}
    </>
  );
}

export function AppShell({
  children,
  navItems,
  ctaHref,
  ctaLabel,
  ctaIconName,
  userLabel,
  userSub,
  portalLabel = "Bio D. Scan",
  portalSub,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Single source of truth for the current path — passed to both sidebar
  // instances so they always render identically.
  const pathname = usePathname();
  // Optimistic active href: set instantly on click, cleared when pathname settles.
  const [activeHref, setActiveHref] = useState<string | null>(null);

  // Once the real pathname matches the clicked href (or changes for any reason),
  // clear the optimistic value so pathname-based matching takes over again.
  useEffect(() => {
    setActiveHref(null);
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleNavClick = useCallback((href: string) => {
    setActiveHref(href);   // instant highlight
    setSidebarOpen(false); // close mobile drawer
  }, []);

  const sharedSidebarProps: SidebarContentProps = {
    navItems,
    ctaHref,
    ctaLabel,
    ctaIconName,
    userLabel,
    userSub,
    portalLabel,
    portalSub,
    pathname,
    activeHref,
    onNavClick: handleNavClick,
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar (always visible lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-52 bg-[var(--bg-cream)] border-r border-[var(--border-subtle)] z-30">
        <SidebarContent {...sharedSidebarProps} />
      </aside>

      {/* ── Mobile sidebar drawer ── */}
      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-screen w-64 flex flex-col bg-[var(--bg-cream)] border-r border-[var(--border-subtle)] z-50 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--green-pale)]/40 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarContent {...sharedSidebarProps} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-52">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 h-12 flex items-center gap-3 px-4 bg-[var(--bg-cream)]/90 backdrop-blur border-b border-[var(--border-subtle)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--green-pale)]/40 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-[var(--green-deep)] text-base">
            {portalLabel}
          </span>
        </header>

        {/* Page content with max-width cap */}
        <main className="flex-1 w-full">
          <div className="max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
