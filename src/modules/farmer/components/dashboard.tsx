"use client";

import { useState, useEffect } from "react";
import { useFarmerStore } from "@/modules/farmer/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  ScanLine,
  Star,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { MOCK_FARMERS, INSECT_KINDS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function LiveScanPreview() {
  const { liveScan, startScan, stopScan, simulateCapture } = useFarmerStore();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!liveScan.isScanning) return;
    const interval = setInterval(() => {
      simulateCapture();
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveScan.isScanning, simulateCapture]);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine size={16} className="text-[var(--green-deep)]" />
            Live Scan Preview
          </CardTitle>
          {liveScan.isScanning ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--green-light)]">
              <span className="w-2 h-2 rounded-full bg-[var(--green-light)] animate-pulse" />
              Scanning
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Idle</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Camera preview placeholder */}
        <div
          className={cn(
            "relative rounded-xl overflow-hidden bg-[var(--green-deep)] aspect-video flex items-center justify-center mb-4 transition-all duration-300",
            pulse && "ring-2 ring-[var(--green-light)]"
          )}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white/40 rounded-full" />
          </div>
          {liveScan.isScanning ? (
            <div className="text-center">
              <ScanLine size={32} className="text-white/60 mx-auto mb-2 animate-pulse" />
              <p className="text-white/60 text-xs">AI model processing feed…</p>
            </div>
          ) : (
            <div className="text-center">
              <ScanLine size={32} className="text-white/30 mx-auto mb-2" />
              <p className="text-white/40 text-xs">Camera inactive</p>
            </div>
          )}
          {pulse && liveScan.lastCapture && (
            <div className="absolute bottom-3 left-3 right-3 bg-[var(--green-deep)]/90 rounded-lg px-3 py-2 backdrop-blur">
              <p className="text-white text-xs font-medium">
                ✓ Captured: {liveScan.lastCapture.commonName}
              </p>
              <p className="text-white/60 text-[10px]">
                AI Confidence: {liveScan.lastCapture.aiConfidence.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {liveScan.lastCapture && (
          <div className="flex items-start gap-3 p-3 bg-[var(--green-pale)]/30 rounded-xl mb-4">
            <Zap size={15} className="text-[var(--green-deep)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--text-dark)]">
                Last: {liveScan.lastCapture.commonName}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {liveScan.lastCapture.trajectory} ·{" "}
                {new Date(liveScan.lastCapture.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {liveScan.isScanning ? (
            <Button onClick={stopScan} variant="outline" size="sm" className="flex-1">
              Stop Scan
            </Button>
          ) : (
            <Button onClick={startScan} size="sm" className="flex-1">
              <ScanLine size={14} /> Start Scan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FarmerDashboard() {
  const { carbonCredits, captures } = useFarmerStore();
  const farmer = MOCK_FARMERS[0];

  const recentCaptures = captures.slice(0, 4);
  const capturesByKind = INSECT_KINDS.map((k) => ({
    ...k,
    count: captures.filter((c) => c.kind === k.kind).length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Field Guide
          </p>
          <h1 className="font-display font-bold text-3xl text-[var(--green-deep)]">
            Good morning, {farmer.name.split(" ")[0]}
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--text-muted)]">
            <MapPin size={13} />
            {farmer.location}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <Star size={16} className="text-[var(--amber-mid)]" fill="currentColor" />
            <span className="font-display font-bold text-2xl text-[var(--green-deep)]">
              {carbonCredits.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">carbon credits</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Captures", value: captures.length, icon: ScanLine, color: "text-[var(--green-deep)]" },
          { label: "Field Area", value: `${farmer.fieldAreaHectares} ha`, icon: MapPin, color: "text-[var(--amber-mid)]" },
          { label: "Credits Earned", value: carbonCredits, icon: Star, color: "text-[var(--amber-deep)]" },
          { label: "Active Days", value: "84", icon: TrendingUp, color: "text-blue-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
                  <p className={cn("font-display font-bold text-2xl", color)}>{value}</p>
                </div>
                <Icon size={18} className={cn("mt-0.5", color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Live scan - spans 1 col */}
        <LiveScanPreview />

        {/* Weather + Insect summary - spans 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Weather card */}
          <Card variant="pale">
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
                    Current Conditions
                  </p>
                  <p className="font-display font-bold text-3xl text-[var(--green-deep)]">
                    {farmer.weather.temp}°C
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{farmer.weather.condition}</p>
                </div>
                <div className="flex gap-5">
                  <div className="flex items-center gap-2 text-sm">
                    <Droplets size={16} className="text-blue-500" />
                    <div>
                      <p className="font-medium text-[var(--text-dark)]">{farmer.weather.humidity}%</p>
                      <p className="text-xs text-[var(--text-muted)]">Humidity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wind size={16} className="text-[var(--green-light)]" />
                    <div>
                      <p className="font-medium text-[var(--text-dark)]">12 km/h</p>
                      <p className="text-xs text-[var(--text-muted)]">Wind</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Thermometer size={16} className="text-[var(--amber-mid)]" />
                    <div>
                      <p className="font-medium text-[var(--text-dark)]">{farmer.weather.temp + 3}°C</p>
                      <p className="text-xs text-[var(--text-muted)]">Feels like</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insect kind breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Insects by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capturesByKind.map(({ kind, label, emoji, count }) => (
                  <div
                    key={kind}
                    className="flex items-center gap-3 p-3 bg-[var(--bg-cream)]/40 rounded-xl"
                  >
                    <span className="text-xl">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-dark)] truncate">{label}</p>
                      <ProgressBar value={count} max={captures.length} className="mt-1" />
                    </div>
                    <span className="text-xs font-semibold text-[var(--green-deep)] shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent captures */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Captures</CardTitle>
            <a href="/insects" className="text-xs text-[var(--green-deep)] hover:underline font-medium">
              View all →
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentCaptures.map((capture) => (
              <div
                key={capture.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-cream)]/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--green-pale)]/60 flex items-center justify-center text-base shrink-0">
                  {INSECT_KINDS.find((k) => k.kind === capture.kind)?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-dark)] truncate">
                    {capture.commonName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {capture.scientificName} · {capture.trajectory}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="green">{capture.aiConfidence.toFixed(0)}%</Badge>
                  <p className="text-[10px] text-[var(--text-light)] mt-0.5 flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    {new Date(capture.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
