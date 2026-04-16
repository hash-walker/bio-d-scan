import { AppShell } from "@/components/layout/app-shell";

const NAV_ITEMS = [
  { href: "/gov/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/gov/farmers", label: "Farmers", iconName: "Users" },
  { href: "/gov/analytics", label: "Analytics", iconName: "BarChart3" },
  { href: "/gov/reports", label: "Reports", iconName: "FileText" },
];

export default function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      navItems={NAV_ITEMS}
      ctaHref="/gov/farmers"
      ctaLabel="Release Credits"
      ctaIconName="Plus"
      userLabel="Gov. Agency"
      userSub="Environmental Authority"
      portalLabel="EcoTrack"
      portalSub="Government Portal"
    >
      {children}
    </AppShell>
  );
}
