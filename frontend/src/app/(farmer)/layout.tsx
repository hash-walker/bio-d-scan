import { AppShell } from "@/components/layout/app-shell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/insects", label: "Insects", iconName: "Bug" },
  { href: "/credits", label: "Credits", iconName: "Star" },
  { href: "/archive", label: "Archive", iconName: "Archive" },
];

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      navItems={NAV_ITEMS}
      ctaHref="/insects"
      ctaLabel="Scan Specimen"
      ctaIconName="ScanLine"
      userLabel="Ahmed Khan"
      userSub="Green Valley Orchards"
      portalLabel="Bio D. Scan"
      portalSub="Farmer Portal"
    >
      {children}
    </AppShell>
  );
}
