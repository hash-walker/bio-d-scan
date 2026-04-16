"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavLink {
  href: string;
  label: string;
}

interface TopNavProps {
  brand?: string;
  links?: TopNavLink[];
  showSearch?: boolean;
  showBell?: boolean;
  showSettings?: boolean;
}

export function TopNav({
  brand = "Bio D. Scan",
  links = [],
  showSearch = true,
  showBell = true,
  showSettings = false,
}: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 bg-[var(--bg-cream)]/90 backdrop-blur border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-8">
        <span className="font-display font-bold text-[var(--green-deep)] text-lg">
          {brand}
        </span>
        {links.length > 0 && (
          <nav className="flex items-center gap-6">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm font-medium pb-0.5 transition-colors",
                    active
                      ? "text-[var(--green-deep)] border-b-2 border-[var(--green-deep)]"
                      : "text-[var(--text-muted)] hover:text-[var(--green-deep)]"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <button className="p-2 rounded-full hover:bg-[var(--green-pale)]/40 text-[var(--text-muted)] transition-colors cursor-pointer">
            <Search size={18} />
          </button>
        )}
        {showBell && (
          <button className="p-2 rounded-full hover:bg-[var(--green-pale)]/40 text-[var(--text-muted)] transition-colors cursor-pointer relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--alert-red)]" />
          </button>
        )}
        {showSettings && (
          <button className="p-2 rounded-full hover:bg-[var(--green-pale)]/40 text-[var(--text-muted)] transition-colors cursor-pointer">
            <Settings size={18} />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-[var(--green-mid)] flex items-center justify-center text-white text-xs font-bold">
          U
        </div>
      </div>
    </header>
  );
}
