"use client";

import { useEffect } from "react";
import { useGovernmentStore } from "@/modules/government/store";
import { INSECT_KINDS } from "@/lib/mock-data";
import { Card, CardContent, CardActionHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { AlertStrip } from "@/components/ui/alert-strip";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Users,
  Leaf,
  Star,
  Bug,
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
        <span className="text-xs text-[var(--text-muted)]">organic</span>
      </div>
    </div>
  );
}

export function GovDashboard() {
  const {
    farmers,
    allCaptures,
    overview,
    creditReleaseFormula,
    getOrgnaicFarmingPercent,
    getTotalCreditsIssued,
    getTotalCaptures,
    releaseCredits,
    fetchAllData,
  } = useGovernmentStore();

  useEffect(() => {
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const organicPct = getOrgnaicFarmingPercent();
  const totalCredits = getTotalCreditsIssued();
  const totalCaptures = getTotalCaptures();

  const capturesByKind = INSECT_KINDS.map((k) => ({
    ...k,
    count: overview?.capturesByKind?.[k.kind] ??
      allCaptures.filter((c) => c.kind === k.kind).length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Regional Analytics Hub"
        title="Farmer Carbon Dashboard"
        subtitle={`Tracking the breath of your soil — ${farmers.length} registered farms`}
        actions={
          <>
            <Button variant="outline">Release Credits</Button>
            <Button variant="secondary">Redeem Credits</Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Registered Farmers" value={farmers.length} icon={Users} color="text-[var(--green-deep)]" sub="+2 this month" />
        <StatCard label="Total Credits Issued" value={totalCredits} icon={Star} color="text-[var(--amber-mid)]" sub="TCO2e" />
        <StatCard label="Total Captures" value={totalCaptures} icon={Bug} color="text-[var(--green-light)]" sub="Across all farms" />
        <StatCard label="Organic Compliance" value={`${organicPct}%`} icon={Leaf} color="text-[var(--green-deep)]" sub="Bio-active farms" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Organic integrity donut */}
        <Card>
          <CardActionHeader title="Organic Integrity" />
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
          <CardActionHeader title="Funds vs. Credits" />
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
                <span className="font-semibold text-[var(--text-dark)]">
                  {totalCredits >= 1000 ? `${(totalCredits / 1000).toFixed(1)}K` : totalCredits} Units
                </span>
              </div>
              <ProgressBar value={Math.min(100, Math.round((totalCredits / 5000) * 100))} color="amber" />
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Credit Release Formula</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-[var(--bg-cream)]/60 rounded-lg">
                  <p className="text-xs text-[var(--text-muted)]">Per capture</p>
                  <p className="font-semibold text-[var(--green-deep)]">{creditReleaseFormula.perCapture} credits</p>
                </div>
                <div className="p-2 bg-[var(--bg-cream)]/60 rounded-lg">
                  <p className="text-xs text-[var(--text-muted)]">Organic bonus</p>
                  <p className="font-semibold text-[var(--green-deep)]">+{creditReleaseFormula.organicBonus}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rare detection + alert */}
        <div className="space-y-4">
          <Card variant="dark" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <CardActionHeader
              title="Rare Specimen Detected"
              icon={<Bug size={16} className="text-white" />}
              className="mb-3 [&_h3]:text-white"
            />
            <CardContent>
              <p className="text-white/70 text-xs leading-relaxed mb-3">
                The Monarch-Crested Beetle was flagged by Node 42-B in the Northern Canopy.
              </p>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 text-xs">
                View Profile
              </Button>
            </CardContent>
          </Card>

          <AlertStrip
            message={
              <>
                <span className="font-semibold uppercase tracking-wide block mb-0.5">Alert: Dry Spells</span>
                Decreased moisture detected in Sector 7. Irrigation funding boost recommended.
              </>
            }
          />
        </div>
      </div>

      {/* Farmers table */}
      <Card>
        <CardActionHeader
          title="All Farmers"
          action={
            <Link
              href="/gov/farmers"
              className="text-xs text-[var(--green-deep)] hover:underline font-medium flex items-center gap-1"
            >
              View full list <ArrowRight size={12} />
            </Link>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Farmer", "Location", "Method", "Credits", "Captures", "Action"].map((h) => (
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
                        <Avatar name={farmer.name} size="sm" />
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
                          farmer.farmingMethod === "organic" ? "green"
                          : farmer.farmingMethod === "transitioning" ? "amber"
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
