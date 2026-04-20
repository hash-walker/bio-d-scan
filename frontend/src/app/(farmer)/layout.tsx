"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/modules/auth/store";
import { useFarmerStore } from "@/modules/farmer/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/insects", label: "Insects", iconName: "Bug" },
  { href: "/credits", label: "Credits", iconName: "Star" },
  { href: "/archive", label: "Archive", iconName: "Archive" },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const fetchFarmerData = useFarmerStore((s) => s.fetchFarmerData);
  const initWebSocket = useFarmerStore((s) => s.initWebSocket);

  useEffect(() => {
    let wsCleanup: (() => void) | undefined;
    let refreshTimer: ReturnType<typeof setInterval> | undefined;
    (async () => {
      await fetchFarmerData();
      wsCleanup = initWebSocket();
      const refreshMs = Number(process.env.NEXT_PUBLIC_CAPTURE_REFRESH_MS || "60000");
      refreshTimer = setInterval(() => {
        void fetchFarmerData();
      }, refreshMs);
    })();
    return () => {
      wsCleanup?.();
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [fetchFarmerData, initWebSocket]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AppShell
      navItems={NAV_ITEMS}
      ctaHref="/insects"
      ctaLabel="Scan Specimen"
      ctaIconName="ScanLine"
      userLabel={user?.name ?? "Farmer"}
      userSub="Farmer Portal"
      portalLabel="Bio D. Scan"
      portalSub="Farmer Portal"
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
