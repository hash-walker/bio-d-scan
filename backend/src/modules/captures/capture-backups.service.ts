import fs from "fs/promises";
import path from "path";
import { labelToKind } from "./captures.schema";

const DEFAULT_BACKUPS_DIR = path.resolve(process.cwd(), "data", "pi-backups");
const BACKUPS_DIR = process.env.BACKUP_CAPTURES_DIR || DEFAULT_BACKUPS_DIR;

interface RawBackupDetection {
  tracking_id: number;
  label: string;
  confidence: number;
  first_seen_at: string;
  best_seen_at: string;
  image_path?: string;
  bbox?: number[];
  frame_size?: number[];
  backup_run_id?: string;
}

export interface BackupRunSummary {
  id: string;
  startedAt: string | null;
  latestSeenAt: string | null;
  detectionCount: number;
  imageCount: number;
  metadataCount: number;
}

export interface BackupCapture {
  id: string;
  runId: string;
  trackingId: number;
  label: string;
  kind: string;
  confidence: number;
  firstSeenAt: string;
  bestSeenAt: string;
  timestamp: string;
  imageUrl: string | null;
  imagePath: string | null;
  bboxXyxy: number[];
  frameSize: number[] | null;
  raw: RawBackupDetection;
}

export interface BackupRunsResponse {
  runs: BackupRunSummary[];
  nextOffset: number | null;
  rootDir: string;
}

export interface BackupCapturesResponse {
  run: BackupRunSummary;
  captures: BackupCapture[];
  nextOffset: number | null;
}

export interface AllBackupCapturesResponse {
  captures: BackupCapture[];
  nextOffset: number | null;
  total: number;
}

type CachedRun = {
  mtimeMs: number;
  run: BackupRunSummary;
  captures: BackupCapture[];
};

const runCache = new Map<string, CachedRun>();

function parseTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function assetUrl(runId: string, imagePath?: string): string | null {
  if (!imagePath) return null;
  return `/backup-assets/${encodeURIComponent(runId)}/images/${encodeURIComponent(path.basename(imagePath))}`;
}

async function directoryExists(target: string): Promise<boolean> {
  try {
    const stat = await fs.stat(target);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function safeCountFiles(target: string): Promise<number> {
  try {
    const entries = await fs.readdir(target, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).length;
  } catch {
    return 0;
  }
}

async function listRunIds(): Promise<string[]> {
  if (!(await directoryExists(BACKUPS_DIR))) return [];
  const entries = await fs.readdir(BACKUPS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
}

async function loadRun(runId: string): Promise<CachedRun> {
  const runDir = path.join(BACKUPS_DIR, runId);
  const detectionsPath = path.join(runDir, "detections.jsonl");
  const stat = await fs.stat(detectionsPath);
  const cached = runCache.get(runId);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached;

  const content = await fs.readFile(detectionsPath, "utf8");
  const bestByTrackingId = new Map<number, BackupCapture>();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let raw: RawBackupDetection;
    try {
      raw = JSON.parse(trimmed) as RawBackupDetection;
    } catch {
      continue;
    }

    const runFromRecord = raw.backup_run_id || runId;
    const capture: BackupCapture = {
      id: `${runFromRecord}-${raw.tracking_id}`,
      runId: runFromRecord,
      trackingId: raw.tracking_id,
      label: raw.label,
      kind: labelToKind(raw.label),
      confidence: raw.confidence,
      firstSeenAt: raw.first_seen_at,
      bestSeenAt: raw.best_seen_at,
      timestamp: raw.best_seen_at || raw.first_seen_at,
      imageUrl: assetUrl(runId, raw.image_path),
      imagePath: raw.image_path ?? null,
      bboxXyxy: Array.isArray(raw.bbox) ? raw.bbox : [],
      frameSize: Array.isArray(raw.frame_size) ? raw.frame_size : null,
      raw,
    };

    const existing = bestByTrackingId.get(raw.tracking_id);
    if (!existing) {
      bestByTrackingId.set(raw.tracking_id, capture);
      continue;
    }

    const shouldReplace =
      capture.confidence > existing.confidence ||
      (capture.confidence === existing.confidence &&
        parseTimestamp(capture.bestSeenAt) > parseTimestamp(existing.bestSeenAt));

    if (shouldReplace) {
      bestByTrackingId.set(raw.tracking_id, capture);
    }
  }

  const captures = Array.from(bestByTrackingId.values()).sort(
    (a, b) => parseTimestamp(b.bestSeenAt) - parseTimestamp(a.bestSeenAt)
  );

  const imageCount = await safeCountFiles(path.join(runDir, "images"));
  const metadataCount = await safeCountFiles(path.join(runDir, "metadata"));
  const run: BackupRunSummary = {
    id: runId,
    startedAt: captures[captures.length - 1]?.firstSeenAt ?? null,
    latestSeenAt: captures[0]?.bestSeenAt ?? null,
    detectionCount: captures.length,
    imageCount,
    metadataCount,
  };

  const next = { mtimeMs: stat.mtimeMs, run, captures };
  runCache.set(runId, next);
  return next;
}

export const captureBackupsService = {
  rootDir: BACKUPS_DIR,

  async listRuns(limit = 5, offset = 0): Promise<BackupRunsResponse> {
    const runIds = await listRunIds();
    const pageIds = runIds.slice(offset, offset + limit);
    const runs = await Promise.all(
      pageIds.map(async (runId) => {
        try {
          return (await loadRun(runId)).run;
        } catch {
          return null;
        }
      })
    );

    const filteredRuns = runs.filter((run): run is BackupRunSummary => run !== null);
    const nextOffset = offset + pageIds.length < runIds.length ? offset + pageIds.length : null;

    return {
      runs: filteredRuns,
      nextOffset,
      rootDir: BACKUPS_DIR,
    };
  },

  async getRunCaptures(runId: string, limit = 24, offset = 0): Promise<BackupCapturesResponse> {
    const { run, captures } = await loadRun(runId);
    const nextOffset = offset + limit < captures.length ? offset + limit : null;
    return {
      run,
      captures: captures.slice(offset, offset + limit),
      nextOffset,
    };
  },

  async listCaptures(limit = 100, offset = 0): Promise<AllBackupCapturesResponse> {
    const runIds = await listRunIds();
    const loadedRuns = await Promise.all(
      runIds.map(async (runId) => {
        try {
          return await loadRun(runId);
        } catch {
          return null;
        }
      })
    );

    const captures = loadedRuns
      .filter((entry): entry is CachedRun => entry !== null)
      .flatMap((entry) => entry.captures)
      .sort((a, b) => parseTimestamp(b.bestSeenAt) - parseTimestamp(a.bestSeenAt));

    return {
      captures: captures.slice(offset, offset + limit),
      nextOffset: offset + limit < captures.length ? offset + limit : null,
      total: captures.length,
    };
  },
};
