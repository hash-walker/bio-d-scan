"use client";

import { useState, useEffect } from "react";
import { useGovernmentStore } from "@/modules/government/store";
import { INSECT_KINDS } from "@/lib/mock-data";
import { govApi, type Capture as ApiCapture } from "@/lib/api";
import type { InsectCapture, InsectKind } from "@/modules/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Farmer } from "@/modules/shared/types";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Thermometer,
  Droplets,
  Star,
  ChevronRight,
  X,
  Zap,
  Leaf,
  Tractor,
  Waves,
} from "lucide-react";

const METHOD_COLORS: Record<string, "green" | "amber" | "gray"> = {
  organic: "green",
  transitioning: "amber",
  commercial: "gray",
};

function FarmerCard({
  farmer,
  selected,
  onSelect,
}: {
  farmer: Farmer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left bg-white rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-sm",
        selected
          ? "border-[var(--green-deep)] shadow-md"
          : "border-[var(--border-subtle)] hover:border-[var(--green-light)]"
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={farmer.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-dark)] truncate">{farmer.name}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{farmer.farmName}</p>
        </div>
        <ChevronRight size={14} className={cn("text-[var(--text-light)] shrink-0 transition-transform", selected && "rotate-90")} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <MapPin size={10} />
          <span className="truncate">{farmer.location.split(",")[0]}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <Star size={10} className="text-[var(--amber-mid)]" />
          <span>{farmer.carbonCredits.toLocaleString()} credits</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant={METHOD_COLORS[farmer.farmingMethod] ?? "gray"} className="capitalize">
          {farmer.farmingMethod}
        </Badge>
        <span className="text-xs text-[var(--text-muted)]">{farmer.fieldAreaHectares} ha</span>
      </div>
    </button>
  );
}

function apiCaptureToInsect(c: ApiCapture): InsectCapture {
  const kindMeta = INSECT_KINDS.find((k) => k.kind === c.kind) ?? INSECT_KINDS[0];
  return {
    id: c.id,
    kind: (c.kind as InsectKind) ?? "beetle",
    commonName: `${c.label.charAt(0).toUpperCase()}${c.label.slice(1)} #${c.trackingId}`,
    scientificName: kindMeta?.scientificName ?? "Specimen spp.",
    timestamp: c.timestamp,
    lat: c.lat ?? 31.55,
    lng: c.lng ?? 74.34,
    aiConfidence: Math.round(c.confidence * 100),
    trajectory: c.trajectory ?? undefined,
    imageUrl: c.imageS3Uri ?? undefined,
  };
}

function FarmerDetail({ farmer, captures }: { farmer: Farmer; captures: InsectCapture[] }) {
  const { releaseCredits } = useGovernmentStore();
  const captureBreakdown = INSECT_KINDS.map((k) => ({
    ...k,
    count: captures.filter((c) => c.kind === k.kind).length,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card variant="dark" className="relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-x-8 translate-y-8" />
        <CardContent className="relative">
          <div className="flex items-start gap-4">
            <Avatar name={farmer.name} size="lg" className="rounded-2xl bg-white/20 text-2xl" />
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl text-white">{farmer.name}</h2>
              <p className="text-white/60 text-sm">{farmer.farmName}</p>
              <div className="flex items-center gap-1.5 mt-1 text-white/50 text-xs">
                <MapPin size={11} />
                {farmer.location}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Credits", value: farmer.carbonCredits.toLocaleString() },
              { label: "Captures", value: farmer.totalCaptures },
              { label: "Area", value: `${farmer.fieldAreaHectares}ha` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-white/50 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather */}
      <Card variant="pale">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer size={18} className="text-[var(--amber-mid)]" />
              <div>
                <p className="font-bold text-2xl text-[var(--green-deep)]">{farmer.weather.temp}°C</p>
                <p className="text-xs text-[var(--text-muted)]">{farmer.weather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Droplets size={14} className="text-blue-500" />
              {farmer.weather.humidity}% humidity
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farm details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Farm Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Farming Method", value: farmer.farmingMethod, icon: Leaf },
            { label: "Water Source", value: farmer.waterSource, icon: Waves },
            { label: "Field Area", value: `${farmer.fieldAreaHectares} hectares`, icon: Tractor },
            { label: "Joined", value: new Date(farmer.joinedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Icon size={12} />
                {label}
              </div>
              <span className="text-xs font-medium text-[var(--text-dark)] capitalize">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Capture breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Insect Captures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {captureBreakdown.map(({ kind, label, emoji, count }) => (
              <div key={kind} className="flex items-center gap-3">
                <span className="text-lg">{emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <ProgressBar value={count} max={farmer.totalCaptures || 1} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
            {captures.slice(0, 3).map((cap) => (
              <div key={cap.id} className="flex items-center gap-2 text-xs">
                <span>{INSECT_KINDS.find((k) => k.kind === cap.kind)?.emoji}</span>
                <span className="flex-1 truncate text-[var(--text-dark)]">{cap.commonName}</span>
              <span className="text-[var(--text-muted)] shrink-0">{cap.aiConfidence.toFixed(0)}% AI</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credit release */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap size={14} className="text-[var(--amber-mid)]" />
            Release Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Based on the Q3 organic certification formula, this farmer qualifies for additional credits.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { amount: 100, label: "Quick +100" },
              { amount: 200, label: "+200 Organic" },
              { amount: 500, label: "+500 Quarterly" },
              { amount: 1000, label: "+1000 Annual" },
            ].map(({ amount, label }) => (
              <button
                key={amount}
                onClick={() => releaseCredits(farmer.id, amount)}
                className="p-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium text-[var(--green-deep)] hover:bg-[var(--green-pale)]/30 hover:border-[var(--green-light)] transition-all text-left"
              >
                <Star size={11} className="text-[var(--amber-mid)] mb-1" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FarmersPage() {
  const { farmers } = useGovernmentStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [farmerCaptures, setFarmerCaptures] = useState<InsectCapture[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const selectedFarmer = farmers.find((f) => f.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    govApi.farmerDetails(selectedId)
      .then((data) => setFarmerCaptures(data.captures.map(apiCaptureToInsect)))
      .catch(() => setFarmerCaptures([]))
      .finally(() => setLoadingDetails(false));
  }, [selectedId]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Farmers"
        subtitle={`${farmers.length} registered farmers · Click a card to view insect data and release credits`}
      />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Farmer list */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {farmers.map((farmer) => (
              <FarmerCard
                key={farmer.id}
                farmer={farmer}
                selected={selectedId === farmer.id}
                onSelect={() => {
                  const nextId = selectedId === farmer.id ? null : farmer.id;
                  setSelectedId(nextId);
                  if (nextId) setLoadingDetails(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Detail panel — stacks below list on smaller screens, side-by-side on xl */}
        {selectedFarmer && (
          <div className="xl:w-80 xl:shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                Farmer Detail
              </h2>
              <button
                onClick={() => setSelectedId(null)}
                className="text-[var(--text-light)] hover:text-[var(--text-dark)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {loadingDetails ? (
              <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">
                Loading captures…
              </div>
            ) : (
              <FarmerDetail farmer={selectedFarmer} captures={farmerCaptures} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
