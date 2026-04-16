"use client";

import { useState } from "react";
import { useGovernmentStore } from "@/modules/government/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { INSECT_KINDS, MOCK_FARMERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Star,
  Bug,
  Leaf,
  Users,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Settings2,
  Send,
} from "lucide-react";

const BIOSPHERE_ZONES = [
  { id: "A-12", name: "Zone A-12 (Canopy)", health: 18, status: "critical" as const },
  { id: "B-04", name: "Zone B-04 (Wetlands)", health: 52, status: "stable" as const },
  { id: "C-07", name: "Zone C-07 (Highland)", health: 75, status: "stable" as const },
  { id: "D-01", name: "Zone D-01 (Northern)", health: 88, status: "healthy" as const },
];

const STATUS_COLOR: Record<string, { bar: "green" | "amber" | "red"; badge: "green" | "amber" | "red" }> = {
  healthy: { bar: "green", badge: "green" },
  stable: { bar: "amber", badge: "amber" },
  critical: { bar: "red", badge: "red" },
};

export function AnalyticsPage() {
  const {
    farmers,
    creditReleaseFormula,
    updateCreditFormula,
    releaseCredits,
    getTotalCreditsIssued,
    getOrgnaicFarmingPercent,
  } = useGovernmentStore();

  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  const handleBulkRelease = () => {
    setReleasing(true);
    farmers.forEach((f) => {
      const base = f.totalCaptures * creditReleaseFormula.perCapture;
      const bonus =
        f.farmingMethod === "organic"
          ? creditReleaseFormula.organicBonus
          : f.farmingMethod === "transitioning"
          ? creditReleaseFormula.transitioningBonus
          : 0;
      releaseCredits(f.id, base + bonus);
    });
    setTimeout(() => {
      setReleasing(false);
      setReleased(true);
      setTimeout(() => setReleased(false), 3000);
    }, 1500);
  };

  const totalCredits = getTotalCreditsIssued();
  const organicPct = getOrgnaicFarmingPercent();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--green-deep)]">
          Biosphere Health
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Monitoring regional vital signs and funding distribution across 12 bio-zones.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Species Logged", value: "12K+", icon: Bug, color: "text-[var(--green-deep)]" },
          { label: "Organic Farming", value: `${organicPct}%`, icon: Leaf, color: "text-[var(--green-light)]" },
          { label: "Total Credits", value: totalCredits.toLocaleString(), icon: Star, color: "text-[var(--amber-mid)]" },
          { label: "Active Nodes", value: "82", icon: TrendingUp, color: "text-blue-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent>
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
                <Icon size={15} className={color} />
              </div>
              <p className={cn("font-display font-bold text-3xl", color)}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Threat levels / biosphere zones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biosphere Zone Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {BIOSPHERE_ZONES.map((zone) => (
              <div key={zone.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[var(--text-dark)]">{zone.name}</span>
                  <Badge variant={STATUS_COLOR[zone.status].badge} className="uppercase text-[10px]">
                    {zone.status}
                  </Badge>
                </div>
                <ProgressBar
                  value={zone.health}
                  color={STATUS_COLOR[zone.status].bar}
                  showLabel
                />
              </div>
            ))}

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-start gap-2 bg-amber-50/60 rounded-xl p-3">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Zone A-12 is at critical health. Recommend immediate intervention and irrigation funding allocation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credit release formula editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 size={15} className="text-[var(--green-deep)]" />
              <CardTitle className="text-base">Credit Release Formula</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Configure how credits are calculated and distributed to farmers based on their activity and farming method.
            </p>

            {[
              {
                label: "Credits per Capture",
                key: "perCapture" as const,
                value: creditReleaseFormula.perCapture,
                min: 1,
                max: 50,
              },
              {
                label: "Organic Farming Bonus",
                key: "organicBonus" as const,
                value: creditReleaseFormula.organicBonus,
                min: 0,
                max: 1000,
              },
              {
                label: "Transitioning Bonus",
                key: "transitioningBonus" as const,
                value: creditReleaseFormula.transitioningBonus,
                min: 0,
                max: 500,
              },
            ].map(({ label, key, value, min, max }) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-medium text-[var(--text-dark)]">{label}</label>
                  <span className="font-semibold text-[var(--green-deep)]">
                    {value} {key === "perCapture" ? "pts" : "bonus"}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={value}
                  onChange={(e) =>
                    updateCreditFormula({ [key]: parseInt(e.target.value) })
                  }
                  className="w-full accent-[var(--green-deep)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-light)] mt-0.5">
                  <span>{min}</span>
                  <span>{max}</span>
                </div>
              </div>
            ))}

            {/* Preview */}
            <div className="bg-[var(--bg-cream)]/60 rounded-xl p-3 space-y-1.5 text-xs">
              <p className="font-semibold text-[var(--text-dark)] mb-2">Distribution Preview</p>
              {farmers.slice(0, 3).map((f) => {
                const est =
                  f.totalCaptures * creditReleaseFormula.perCapture +
                  (f.farmingMethod === "organic"
                    ? creditReleaseFormula.organicBonus
                    : f.farmingMethod === "transitioning"
                    ? creditReleaseFormula.transitioningBonus
                    : 0);
                return (
                  <div key={f.id} className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{f.name}</span>
                    <span className="font-semibold text-[var(--green-deep)] flex items-center gap-0.5">
                      <Star size={10} className="text-[var(--amber-mid)]" />
                      +{est.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleBulkRelease}
              disabled={releasing}
              className="w-full"
              size="lg"
            >
              {releasing ? (
                <>
                  <Zap size={15} className="animate-pulse" /> Releasing…
                </>
              ) : (
                <>
                  <Send size={15} /> Release Credits to All Farmers
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Per-farmer organic data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organic Farming Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-[var(--bg-cream)]/40 rounded-2xl p-4 border border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--green-mid)] text-white flex items-center justify-center text-xs font-bold">
                    {farmer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-dark)] truncate">{farmer.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{farmer.farmName}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    farmer.farmingMethod === "organic"
                      ? "green"
                      : farmer.farmingMethod === "transitioning"
                      ? "amber"
                      : "gray"
                  }
                  className="capitalize w-full justify-center mb-2"
                >
                  {farmer.farmingMethod}
                </Badge>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <div className="flex justify-between">
                    <span>Area</span>
                    <span className="font-medium text-[var(--text-dark)]">{farmer.fieldAreaHectares} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Captures</span>
                    <span className="font-medium text-[var(--text-dark)]">{farmer.totalCaptures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credits</span>
                    <span className="font-semibold text-[var(--green-deep)]">{farmer.carbonCredits.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success toast */}
      {released && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--green-deep)] text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium z-50">
          <CheckCircle2 size={16} />
          Credits released to all {farmers.length} farmers!
        </div>
      )}
    </div>
  );
}
