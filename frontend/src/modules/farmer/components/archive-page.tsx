"use client";

import { useEffect, useRef, useState } from "react";
import { capturesApi, type BackupCapture, type BackupRun } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Image as ImageIcon,
  LoaderCircle,
  ScanSearch,
} from "lucide-react";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api$/, "");

type RunState = {
  captures: BackupCapture[];
  nextOffset: number | null;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function DetectionCard({ capture }: { capture: BackupCapture }) {
  const imageSrc = capture.imageUrl ? `${BACKEND_URL}${capture.imageUrl}` : null;

  return (
    <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-cream)]/60">
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt={`${capture.label} detection ${capture.trackingId}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-light)]">
              <ImageIcon size={22} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-base font-semibold capitalize text-[var(--text-dark)]">
                {capture.label}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Tracking #{capture.trackingId} in run {capture.runId}
              </p>
            </div>
            <Badge variant="green">{Math.round(capture.confidence * 100)}% AI</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(capture.bestSeenAt)}
            </span>
            <span className="flex items-center gap-1">
              <ScanSearch size={12} />
              {capture.bboxXyxy.length === 4 ? `[${capture.bboxXyxy.join(", ")}]` : "No bbox"}
            </span>
            <span className="flex items-center gap-1">
              <Database size={12} />
              {capture.frameSize ? `${capture.frameSize[0]}x${capture.frameSize[1]}` : "Unknown frame"}
            </span>
          </div>

          <details className="mt-3 rounded-xl bg-[var(--bg-cream)]/45 px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-[var(--green-deep)]">
              Show raw JSON
            </summary>
            <pre className="mt-2 overflow-x-auto text-[11px] leading-5 text-[var(--text-muted)]">
              {JSON.stringify(capture.raw, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </article>
  );
}

function RunSection({
  run,
  state,
  expanded,
  onToggle,
  onLoadMore,
}: {
  run: BackupRun;
  state: RunState | undefined;
  expanded: boolean;
  onToggle: () => void;
  onLoadMore: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div>
            <CardTitle className="text-base text-[var(--green-deep)]">
              Backup Run {run.id}
            </CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {formatDate(run.startedAt)} to {formatDate(run.latestSeenAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="green">{run.detectionCount} detections</Badge>
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <span className="rounded-full bg-[var(--bg-cream)] px-3 py-1">
              {run.imageCount} images
            </span>
            <span className="rounded-full bg-[var(--bg-cream)] px-3 py-1">
              {run.metadataCount} metadata files
            </span>
          </div>

          {state?.error ? (
            <EmptyState
              emoji="⚠️"
              title="Could not load detections"
              description={state.error}
              action={<Button onClick={onLoadMore}>Retry</Button>}
            />
          ) : null}

          {!state?.hasLoaded && !state?.isLoading ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Load this run when you want to inspect the detections and images.
              </p>
              <Button className="mt-4" onClick={onLoadMore}>
                Load detections
              </Button>
            </div>
          ) : null}

          {state?.captures?.length ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {state.captures.map((capture) => (
                <DetectionCard key={capture.id} capture={capture} />
              ))}
            </div>
          ) : null}

          {state?.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--text-muted)]">
              <LoaderCircle size={16} className="animate-spin" />
              Loading detections…
            </div>
          ) : null}

          {state?.hasLoaded && !state.isLoading && state.captures.length === 0 && !state.error ? (
            <EmptyState
              emoji="🗃️"
              title="No detections in this run"
              description="This backup folder exists, but no valid detection rows were found."
            />
          ) : null}

          {state?.nextOffset !== null && !state?.isLoading ? (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={onLoadMore}>
                Load more detections
              </Button>
            </div>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}

export function ArchivePage() {
  const [runs, setRuns] = useState<BackupRun[]>([]);
  const [runsOffset, setRunsOffset] = useState(0);
  const [hasMoreRuns, setHasMoreRuns] = useState(true);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<Record<string, boolean>>({});
  const [runStates, setRunStates] = useState<Record<string, RunState>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const runsMetaRef = useRef({
    runsOffset: 0,
    isLoadingRuns: false,
    hasMoreRuns: true,
  });
  const runStatesRef = useRef<Record<string, RunState>>({});
  const loadRunsRef = useRef<() => Promise<void>>(async () => {});
  const loadRunCapturesRef = useRef<(runId: string) => Promise<void>>(async () => {});

  useEffect(() => {
    runsMetaRef.current = { runsOffset, isLoadingRuns, hasMoreRuns };
  }, [runsOffset, isLoadingRuns, hasMoreRuns]);

  useEffect(() => {
    runStatesRef.current = runStates;
  }, [runStates]);

  loadRunsRef.current = async () => {
    const { runsOffset: nextOffset, isLoadingRuns: loading, hasMoreRuns: hasMore } = runsMetaRef.current;
    if (loading || !hasMore) return;

    setIsLoadingRuns(true);
    setRunsError(null);
    try {
      const response = await capturesApi.backupRuns({ limit: 5, offset: nextOffset });
      setRuns((current) => [
        ...current,
        ...response.runs.filter((run) => !current.some((item) => item.id === run.id)),
      ]);
      setRunsOffset(response.nextOffset ?? nextOffset);
      setHasMoreRuns(response.nextOffset !== null);
    } catch (error) {
      setRunsError(error instanceof Error ? error.message : "Could not load backup runs.");
    } finally {
      setIsLoadingRuns(false);
    }
  };

  loadRunCapturesRef.current = async (runId: string) => {
    const current = runStatesRef.current[runId];
    if (current?.isLoading) return;

    setRunStates((existing) => ({
      ...existing,
      [runId]: {
        captures: existing[runId]?.captures ?? [],
        nextOffset: existing[runId]?.nextOffset ?? 0,
        isLoading: true,
        hasLoaded: existing[runId]?.hasLoaded ?? false,
        error: null,
      },
    }));

    try {
      const response = await capturesApi.backupRunCaptures(runId, {
        limit: 12,
        offset: current?.hasLoaded ? current.nextOffset ?? 0 : 0,
      });

      setRunStates((existing) => {
        const previous = existing[runId];
        const previousCaptures = previous?.captures ?? [];
        const nextCaptures = current?.hasLoaded
          ? [
              ...previousCaptures,
              ...response.captures.filter(
                (capture) => !previousCaptures.some((item) => item.id === capture.id)
              ),
            ]
          : response.captures;

        return {
          ...existing,
          [runId]: {
            captures: nextCaptures,
            nextOffset: response.nextOffset,
            isLoading: false,
            hasLoaded: true,
            error: null,
          },
        };
      });
    } catch (error) {
      setRunStates((existing) => ({
        ...existing,
        [runId]: {
          captures: existing[runId]?.captures ?? [],
          nextOffset: existing[runId]?.nextOffset ?? 0,
          isLoading: false,
          hasLoaded: existing[runId]?.hasLoaded ?? false,
          error: error instanceof Error ? error.message : "Could not load detections.",
        },
      }));
    }
  };

  useEffect(() => {
    void loadRunsRef.current();
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadRunsRef.current();
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--green-deep)]">Archive</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Historical detections mirrored from the Raspberry Pi backup runs.
        </p>
      </div>

      {runs.length === 0 && !isLoadingRuns && !runsError ? (
        <EmptyState
          emoji="🗂️"
          title="No Pi backups found"
          description="Sync the Raspberry Pi backup folder into the backend backup directory to populate the archive."
        />
      ) : null}

      <div className="space-y-4">
        {runs.map((run) => (
          <RunSection
            key={run.id}
            run={run}
            state={runStates[run.id]}
            expanded={Boolean(expandedRuns[run.id])}
            onToggle={() => {
              setExpandedRuns((current) => {
                const nextValue = !current[run.id];
                const next = { ...current, [run.id]: nextValue };
                if (nextValue && !runStates[run.id]?.hasLoaded && !runStates[run.id]?.isLoading) {
                  void loadRunCapturesRef.current(run.id);
                }
                return next;
              });
            }}
            onLoadMore={() => void loadRunCapturesRef.current(run.id)}
          />
        ))}
      </div>

      {runsError ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              emoji="⚠️"
              title="Could not load backup runs"
              description={runsError}
              action={<Button onClick={() => void loadRunsRef.current()}>Retry</Button>}
            />
          </CardContent>
        </Card>
      ) : null}

      <div ref={sentinelRef} className="h-2" />

      {isLoadingRuns ? (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--text-muted)]">
          <LoaderCircle size={16} className="animate-spin" />
          Loading more backup runs…
        </div>
      ) : null}
    </div>
  );
}
