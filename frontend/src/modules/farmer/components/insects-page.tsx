"use client";

import { useState } from "react";
import { useFarmerStore } from "@/modules/farmer/store";
import { INSECT_KINDS } from "@/lib/mock-data";
import { Card, CardContent, CardActionHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InsectKind } from "@/modules/shared/types";
import {
  MapPin,
  Clock,
  Navigation,
  ScanLine,
  ChevronRight,
  X,
} from "lucide-react";
import { CaptureDetailModal } from "./capture-detail-modal";
import type { InsectCapture } from "@/modules/shared/types";

function InsectKindTile({
  kind,
  label,
  emoji,
  description,
  count,
  selected,
  onClick,
}: {
  kind: InsectKind;
  label: string;
  emoji: string;
  description: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group",
        selected
          ? "border-[var(--green-deep)] bg-[var(--green-pale)]/30 shadow-md"
          : "border-[var(--border-subtle)] bg-white hover:border-[var(--green-light)] hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{emoji}</span>
        <span
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full",
            selected
              ? "bg-[var(--green-deep)] text-white"
              : "bg-[var(--bg-cream)] text-[var(--text-muted)]"
          )}
        >
          {count}
        </span>
      </div>
      <h3 className="font-display font-bold text-lg text-[var(--green-deep)] mb-0.5">
        {label}
      </h3>
      <p className="text-xs text-[var(--text-muted)]">{description}</p>
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium mt-3 transition-all",
          selected
            ? "text-[var(--green-deep)]"
            : "text-[var(--text-light)] group-hover:text-[var(--green-deep)]"
        )}
      >
        View captures <ChevronRight size={12} />
      </div>
    </button>
  );
}

function CaptureCard({
  capture,
  onClick,
}: {
  capture: InsectCapture;
  onClick?: () => void;
}) {
  const kindMeta = INSECT_KINDS.find((k) => k.kind === capture.kind);
  const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api$/, "");
  const imageSrc = capture.imageUrl ? `${BACKEND_URL}${capture.imageUrl}` : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[var(--border-subtle)] p-4 hover:shadow-md hover:border-[var(--green-light)] transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--green-pale)]/50 flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-[var(--border-subtle)]">
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imageSrc} alt={capture.commonName} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          ) : (
            kindMeta?.emoji
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--text-dark)]">
                {capture.commonName}
              </p>
              <p className="text-xs text-[var(--text-muted)] italic">
                {capture.scientificName}
              </p>
            </div>
            <Badge variant="green" className="shrink-0">
              {capture.aiConfidence.toFixed(0)}% AI
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Clock size={11} />
              <span className="truncate">
                {new Date(capture.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <MapPin size={11} />
              <span className="truncate">
                {capture.lat.toFixed(3)}, {capture.lng.toFixed(3)}
              </span>
            </div>
            {capture.trajectory && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Navigation size={11} />
                <span className="truncate">{capture.trajectory}</span>
              </div>
            )}
          </div>

          {capture.notes && (
            <p className="mt-2 text-xs text-[var(--text-muted)] bg-[var(--bg-cream)]/60 rounded-lg px-3 py-2 italic">
              &ldquo;{capture.notes}&rdquo;
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function InsectsPage() {
  const { captures, selectedKind, setSelectedKind, startScan, liveScan } =
    useFarmerStore();
  const [selectedCapture, setSelectedCapture] = useState<InsectCapture | null>(null);

  const displayedCaptures = selectedKind
    ? captures.filter((c) => c.kind === selectedKind)
    : captures;

  const capturesWithCounts = INSECT_KINDS.map((k) => ({
    ...k,
    count: captures.filter((c) => c.kind === k.kind).length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Insects"
        subtitle={`${captures.length} total captures across 4 species categories`}
        actions={
          <Button onClick={startScan} disabled={liveScan.isScanning}>
            <ScanLine size={15} />
            {liveScan.isScanning ? "Scanning…" : "New Scan"}
          </Button>
        }
      />

      {/* Insect kind tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {capturesWithCounts.map((k) => (
          <InsectKindTile
            key={k.kind}
            {...k}
            selected={selectedKind === k.kind}
            onClick={() =>
              setSelectedKind(selectedKind === k.kind ? null : k.kind)
            }
          />
        ))}
      </div>

      {/* Capture list */}
      <Card>
        <CardActionHeader
          title={
            selectedKind
              ? `${INSECT_KINDS.find((k) => k.kind === selectedKind)?.label} Captures (${displayedCaptures.length})`
              : `All Captures (${displayedCaptures.length})`
          }
          action={
            selectedKind ? (
              <button
                onClick={() => setSelectedKind(null)}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors"
              >
                <X size={12} /> Clear filter
              </button>
            ) : undefined
          }
        />
        <CardContent>
          {displayedCaptures.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="No captures yet"
              description="No captures found for this insect type."
              action={
                <Button onClick={startScan} size="sm">
                  Start scanning
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {displayedCaptures.map((capture) => (
                <CaptureCard 
                  key={capture.id} 
                  capture={capture} 
                  onClick={() => setSelectedCapture(capture)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCapture && (
        <CaptureDetailModal 
          capture={selectedCapture} 
          onClose={() => setSelectedCapture(null)} 
        />
      )}
    </div>
  );
}
