"use client";

import { X, Clock, MapPin, Navigation, Database, ScanSearch, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INSECT_KINDS } from "@/lib/mock-data";
import type { InsectCapture } from "@/modules/shared/types";

interface CaptureDetailModalProps {
  capture: InsectCapture;
  onClose: () => void;
}

export function CaptureDetailModal({
  capture,
  onClose,
}: CaptureDetailModalProps) {
  const kindMeta = INSECT_KINDS.find((k) => k.kind === capture.kind);
  const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api$/, "");
  const imageSrc = capture.imageUrl ? `${BACKEND_URL}${capture.imageUrl}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 bg-[var(--green-pale)] flex items-center justify-center overflow-hidden">
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imageSrc} alt={capture.commonName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">{kindMeta?.emoji}</span>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-4">
            <Badge variant="green" className="text-sm px-3 py-1 shadow-lg">
              {capture.aiConfidence.toFixed(0)}% Confidence
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{kindMeta?.emoji}</span>
              <h2 className="text-2xl font-display font-bold text-[var(--green-deep)]">
                {capture.commonName}
              </h2>
            </div>
            <p className="text-[var(--text-muted)] italic text-lg">
              {capture.scientificName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-cream)]/50 border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1 text-sm font-medium">
                <Clock size={14} /> Recorded At
              </div>
              <p className="text-[var(--text-dark)] font-semibold">
                {new Date(capture.timestamp).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-cream)]/50 border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1 text-sm font-medium">
                <MapPin size={14} /> Location
              </div>
              <p className="text-[var(--text-dark)] font-semibold">
                {capture.lat.toFixed(4)}, {capture.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {(capture.backupRunId || capture.frameSize || capture.bboxXyxy) && (
            <div className="grid grid-cols-1 gap-4">
              {capture.backupRunId && (
                <div className="p-4 rounded-2xl bg-[var(--bg-cream)]/50 border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1 text-sm font-medium">
                    <Database size={14} /> Backup Run
                  </div>
                  <p className="text-[var(--text-dark)] font-semibold">
                    {capture.backupRunId}
                  </p>
                  {capture.firstSeenAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      First seen: {new Date(capture.firstSeenAt).toLocaleString()}
                    </p>
                  )}
                  {capture.bestSeenAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Best frame: {new Date(capture.bestSeenAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {(capture.bboxXyxy || capture.frameSize) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-cream)]/50 border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1 text-sm font-medium">
                      <ScanSearch size={14} /> Bounding Box
                    </div>
                    <p className="text-[var(--text-dark)] font-semibold break-words">
                      {capture.bboxXyxy ? `[${capture.bboxXyxy.join(", ")}]` : "n/a"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg-cream)]/50 border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1 text-sm font-medium">
                      <ImageIcon size={14} /> Frame Size
                    </div>
                    <p className="text-[var(--text-dark)] font-semibold">
                      {capture.frameSize ? `${capture.frameSize[0]}x${capture.frameSize[1]}` : "n/a"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {capture.trajectory && (
            <div className="p-4 rounded-2xl bg-[var(--bg-cream)]/50 border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1 text-sm font-medium">
                <Navigation size={14} /> Trajectory
              </div>
              <p className="text-[var(--text-dark)] font-semibold">
                {capture.trajectory}
              </p>
            </div>
          )}

          {capture.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[var(--green-deep)] uppercase tracking-wider">AI Analysis Notes</h4>
              <p className="text-[var(--text-muted)] bg-[var(--bg-cream)]/60 rounded-xl p-4 italic leading-relaxed border-l-4 border-[var(--green-light)]">
                &ldquo;{capture.notes}&rdquo;
              </p>
            </div>
          )}

          <Button 
            onClick={onClose}
            className="w-full py-6 rounded-2xl text-lg font-bold"
          >
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}
