"use client";

import { useGovernmentStore } from "@/modules/government/store";
import { INSECT_KINDS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import {
  Users,
  Leaf,
  Star,
  Bug,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

function DonutChart({ percent }: { percent: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const bioActive = (percent / 100) * circ;
  const traditional = circ - bioActive;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#DDD8CC" strokeWidth="14" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="var(--amber-mid)" strokeWidth="14"
          strokeDasharray={`${traditional} ${circ}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="var(--green-deep)" strokeWidth="14"
          strokeDasharray={`${bioActive} ${circ}`}
          strokeDashoffset={-traditional}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl text-[var(--green-deep)]">{percent}%</span>
        <span className="text-xs text-[var(--text-muted)]">ORGANIC</span>
      </div>
    </div>
  );
}

export function GovDashboard() {
  const {
    farmers,
    allCaptures,
    getOrgnaicFarmingPercent,
    getTotalCreditsIssued,
    getTotalCaptures,
    releaseCredits,
  } = useGovernmentStore();

  const organicPct = getOrgnaicFarmingPercent();
  const totalCredits = getTotalCreditsIssued();
  const totalCaptures = getTotalCaptures();

  const capturesByKind = INSECT_KINDS.map((k) => ({
    ...k,
    count: allCaptures.filter((c) => c.kind === k.kind).length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Regional Analytics Hub
          </p>
          <h1 className="font-display font-bold text-3xl text-[var(--green-deep)]">
            Farmer Carbon Dashboard
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Tracking the breath of your soil — {farmers.length} registered farms
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Release Credits</Button>
          <Button variant="secondary">Redeem Credits</Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Registered Farmers",
            value: farmers.length,
            icon: Users,
            color: "text-[var(--green-deep)]",
            sub: "+2 this month",
          },
          {
            label: "Total Credits Issued",
            value: totalCredits.toLocaleString(),
            icon: Star,
            color: "text-[var(--amber-mid)]",
            sub: "TCO2e",
          },
          {
            label: "Total Captures",
            value: totalCaptures.toLocaleString(),
            icon: Bug,
            color: "text-[var(--green-light)]",
            sub: "Across all farms",
          },
          {
            label: "Organic Compliance",
            value: `${organicPct}%`,
            icon: Leaf,
            color: "text-[var(--green-deep)]",
            sub: "Bio-active farms",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label}>
            <CardContent>
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
                <Icon size={16} className={color} />
              </div>
              <p className={cn("font-display font-bold text-3xl", color)}>{value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Organic integrity donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organic Integrity</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart percent={organicPct} />
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[var(--green-deep)]" />
                <span className="text-xs text-[var(--text-muted)]">Bio-Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[var(--amber-mid)]" />
                <span className="text-xs text-[var(--text-muted)]">Traditional</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funds vs credits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funds vs. Credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-muted)] uppercase tracking-wide">Allocated Funds</span>
                <span className="font-semibold text-[var(--text-dark)]">$4.2M</span>
              </div>
              <ProgressBar value={72} color="green" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-muted)] uppercase tracking-wide">Carbon Credits Issued</span>
                <span className="font-semibold text-[var(--text-dark)]">2.8K Units</span>
              </div>
              <ProgressBar value={40} color="amber" />
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Credit Release Formula</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-[var(--bg-cream)]/60 rounded-lg">
                  <p className="text-xs text-[var(--text-muted)]">Per capture</p>
                  <p className="font-semibold text-[var(--green-deep)]">5 credits</p>
                </div>
                <div className="p-2 bg-[var(--bg-cream)]/60 rounded-lg">
                  <p className="text-xs text-[var(--text-muted)]">Organic bonus</p>
                  <p className="font-semibold text-[var(--green-deep)]">+200</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rare detection alert */}
        <div className="space-y-4">
          <Card variant="dark" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bug size={16} className="text-white" />
                <CardTitle className="text-base text-white">Rare Specimen Detected</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-xs leading-relaxed mb-3">
                The Monarch-Crested Beetle was flagged by Node 42-B in the Northern Canopy.
              </p>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 text-xs">
                View Profile
              </Button>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Alert: Dry Spells
              </p>
            </div>
            <p className="text-xs text-amber-600">
              Decreased moisture detected in Sector 7. Irrigation funding boost recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Farmers table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Farmers</CardTitle>
            <Link
              href="/gov/farmers"
              className="text-xs text-[var(--green-deep)] hover:underline font-medium flex items-center gap-1"
            >
              View full list <ArrowRight size={12} />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Farmer", "Location", "Method", "Credits", "Captures", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide pb-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-cream)]/40 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--green-mid)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {farmer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-dark)]">{farmer.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{farmer.farmName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                        <MapPin size={11} />
                        {farmer.location.split(",")[0]}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          farmer.farmingMethod === "organic"
                            ? "green"
                            : farmer.farmingMethod === "transitioning"
                            ? "amber"
                            : "gray"
                        }
                        className="capitalize"
                      >
                        {farmer.farmingMethod}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-[var(--amber-mid)]" />
                        <span className="font-semibold">{farmer.carbonCredits.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-[var(--text-dark)]">{farmer.totalCaptures}</span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => releaseCredits(farmer.id, 100)}
                        className="flex items-center gap-1 text-xs font-medium text-[var(--green-deep)] hover:underline transition-colors"
                      >
                        <Zap size={11} /> Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Capture by insect type */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {capturesByKind.map(({ kind, label, emoji, count }) => (
          <Card key={kind}>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text-dark)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)]">total captures</p>
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-[var(--green-deep)]">{count}</p>
              <ProgressBar value={count} max={allCaptures.length || 1} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
