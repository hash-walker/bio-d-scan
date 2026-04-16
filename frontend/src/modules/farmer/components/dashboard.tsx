"use client";

import { useState, useEffect } from "react";
import { useFarmerStore } from "@/modules/farmer/store";
import { Card, CardContent, CardActionHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { ListRow, EmojiTile } from "@/components/ui/list-row";
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
  const { liveScan, startScan, stopScan, simulateCapture, liveStreamUrl } = useFarmerStore();
  const [pulse, setPulse] = useState(false);
  const [wsConnected] = useState(false);

  // Fallback simulation when backend is offline
  useEffect(() => {
    if (!liveScan.isScanning || wsConnected) return;
    const interval = setInterval(() => {
      simulateCapture();
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveScan.isScanning, simulateCapture, wsConnected]);

  // Visual pulse on every real capture event
  useEffect(() => {
    if (!liveScan.lastCapture) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [liveScan.lastCapture]);

  return (
    <Card className="relative overflow-hidden">
      <CardActionHeader
        title="Live Scan Preview"
        icon={<ScanLine size={16} className="text-[var(--green-deep)]" />}
        action={
          liveScan.isScanning ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--green-light)]">
              <span className="w-2 h-2 rounded-full bg-[var(--green-light)] animate-pulse" />
              Scanning
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Idle</span>
          )
        }
      />

      <CardContent>
        {/* Camera preview — shows Pi MJPEG stream when available */}
        <div
          className={cn(
            "relative rounded-xl overflow-hidden bg-[var(--green-deep)] aspect-video flex items-center justify-center mb-4 transition-all duration-300",
            pulse && "ring-2 ring-[var(--green-light)]"
          )}
        >
          {liveStreamUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={liveStreamUrl}
              alt="Live camera feed"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
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
            </>
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

        {liveScan.isScanning ? (
          <Button onClick={stopScan} variant="outline" size="sm" className="w-full">
            Stop Scan
          </Button>
        ) : (
          <Button onClick={startScan} size="sm" className="w-full">
            <ScanLine size={14} /> Start Scan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function FarmerDashboard() {
  const { carbonCredits, captures, farmerName, currentFarmer, fetchFarmerData, initWebSocket } = useFarmerStore();
  const fallbackFarmer = MOCK_FARMERS[0];
  const location = currentFarmer?.location ?? fallbackFarmer.location;
  const weather = currentFarmer?.weather ?? fallbackFarmer.weather;
  const fieldAreaHectares = currentFarmer?.fieldAreaHectares ?? fallbackFarmer.fieldAreaHectares;

  useEffect(() => {
    fetchFarmerData();
    const cleanup = initWebSocket();
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentCaptures = captures.slice(0, 4);
  const capturesByKind = INSECT_KINDS.map((k) => ({
    ...k,
    count: captures.filter((c) => c.kind === k.kind).length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Field Guide"
        title={`Good morning, ${farmerName.split(" ")[0]}`}
        subtitle={
          <span className="flex items-center gap-1.5">
            <MapPin size={13} />
            {location}
          </span>
        }
        actions={
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Star size={16} className="text-[var(--amber-mid)]" fill="currentColor" />
              <span className="font-display font-bold text-2xl text-[var(--green-deep)]">
                {carbonCredits.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">carbon credits</p>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Captures" value={captures.length} icon={ScanLine} color="text-[var(--green-deep)]" size="sm" />
        <StatCard label="Field Area" value={`${fieldAreaHectares} ha`} icon={MapPin} color="text-[var(--amber-mid)]" size="sm" />
        <StatCard label="Credits Earned" value={carbonCredits} icon={Star} color="text-[var(--amber-deep)]" size="sm" />
        <StatCard label="Active Days" value="84" icon={TrendingUp} color="text-blue-600" size="sm" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <LiveScanPreview />

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
                    {weather.temp}°C
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{weather.condition}</p>
                </div>
                <div className="flex gap-5">
                  {[
                    { icon: Droplets, value: `${weather.humidity}%`, label: "Humidity", color: "text-blue-500" },
                    { icon: Wind, value: "12 km/h", label: "Wind", color: "text-[var(--green-light)]" },
                    { icon: Thermometer, value: `${weather.temp + 3}°C`, label: "Feels like", color: "text-[var(--amber-mid)]" },
                  ].map(({ icon: Icon, value, label, color }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <Icon size={16} className={color} />
                      <div>
                        <p className="font-medium text-[var(--text-dark)]">{value}</p>
                        <p className="text-xs text-[var(--text-muted)]">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insect kind breakdown */}
          <Card>
            <CardActionHeader title="Insects by Type" />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capturesByKind.map(({ kind, label, emoji, count }) => (
                  <div key={kind} className="flex items-center gap-3 p-3 bg-[var(--bg-cream)]/40 rounded-xl">
                    <span className="text-xl">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-dark)] truncate">{label}</p>
                      <ProgressBar value={count} max={captures.length || 1} className="mt-1" />
                    </div>
                    <span className="text-xs font-semibold text-[var(--green-deep)] shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent captures */}
      <Card>
        <CardActionHeader
          title="Recent Captures"
          action={
            <a href="/insects" className="text-xs text-[var(--green-deep)] hover:underline font-medium">
              View all →
            </a>
          }
        />
        <CardContent>
          <div className="space-y-1">
            {recentCaptures.map((capture) => {
              const kindMeta = INSECT_KINDS.find((k) => k.kind === capture.kind);
              return (
                <ListRow
                  key={capture.id}
                  leading={<EmojiTile emoji={kindMeta?.emoji ?? "🦋"} />}
                  title={capture.commonName}
                  subtitle={`${capture.scientificName} · ${capture.trajectory ?? ""}`}
                  trailing={
                    <div className="text-right">
                      <Badge variant="green">{capture.aiConfidence.toFixed(0)}%</Badge>
                      <p className="text-[10px] text-[var(--text-light)] mt-0.5 flex items-center gap-1 justify-end">
                        <Clock size={10} />
                        {new Date(capture.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  }
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
