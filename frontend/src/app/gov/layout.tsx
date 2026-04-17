"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/modules/auth/store";

const NAV_ITEMS = [
  { href: "/gov/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/gov/farmers", label: "Farmers", iconName: "Users" },
  { href: "/gov/analytics", label: "Analytics", iconName: "BarChart3" },
  { href: "/gov/reports", label: "Reports", iconName: "FileText" },
];

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AppShell
      navItems={NAV_ITEMS}
      ctaHref="/gov/farmers"
      ctaLabel="Release Credits"
      ctaIconName="Plus"
      userLabel={user?.name ?? "Government"}
      userSub={user?.department ?? "Government Portal"}
      portalLabel="EcoTrack"
      portalSub="Government Portal"
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
