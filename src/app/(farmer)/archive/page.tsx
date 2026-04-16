import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CAPTURES, INSECT_KINDS } from "@/lib/mock-data";
import { Clock, Navigation, MapPin } from "lucide-react";

export default function ArchivePage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--green-deep)]">Archive</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Complete historical record of all field observations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Observations ({MOCK_CAPTURES.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_CAPTURES.map((capture) => {
              const kindMeta = INSECT_KINDS.find((k) => k.kind === capture.kind);
              return (
                <div
                  key={capture.id}
                  className="flex items-start gap-4 p-4 bg-[var(--bg-cream)]/30 rounded-2xl border border-[var(--border-subtle)]"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl border border-[var(--border-subtle)] shrink-0">
                    {kindMeta?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-[var(--text-dark)]">{capture.commonName}</p>
                        <p className="text-xs text-[var(--text-muted)] italic">{capture.scientificName}</p>
                      </div>
                      <Badge variant="green">{capture.aiConfidence.toFixed(0)}% AI</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(capture.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {capture.lat.toFixed(4)}, {capture.lng.toFixed(4)}
                      </span>
                      {capture.trajectory && (
                        <span className="flex items-center gap-1">
                          <Navigation size={11} />
                          {capture.trajectory}
                        </span>
                      )}
                    </div>
                    {capture.notes && (
                      <p className="mt-2 text-xs italic text-[var(--text-muted)] bg-white/60 rounded-lg px-3 py-1.5">
                        &ldquo;{capture.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
