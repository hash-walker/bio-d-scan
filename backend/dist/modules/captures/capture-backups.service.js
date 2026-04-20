"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureBackupsService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const captures_schema_1 = require("./captures.schema");
const DEFAULT_BACKUPS_DIR = path_1.default.resolve(process.cwd(), "data", "pi-backups");
const BACKUPS_DIR = process.env.BACKUP_CAPTURES_DIR || DEFAULT_BACKUPS_DIR;
const runCache = new Map();
function parseTimestamp(value) {
    if (!value)
        return 0;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}
function assetUrl(runId, imagePath) {
    if (!imagePath)
        return null;
    return `/backup-assets/${encodeURIComponent(runId)}/images/${encodeURIComponent(path_1.default.basename(imagePath))}`;
}
async function directoryExists(target) {
    try {
        const stat = await promises_1.default.stat(target);
        return stat.isDirectory();
    }
    catch {
        return false;
    }
}
async function safeCountFiles(target) {
    try {
        const entries = await promises_1.default.readdir(target, { withFileTypes: true });
        return entries.filter((entry) => entry.isFile()).length;
    }
    catch {
        return 0;
    }
}
async function listRunIds() {
    if (!(await directoryExists(BACKUPS_DIR)))
        return [];
    const entries = await promises_1.default.readdir(BACKUPS_DIR, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort((a, b) => b.localeCompare(a));
}
async function loadRun(runId) {
    const runDir = path_1.default.join(BACKUPS_DIR, runId);
    const detectionsPath = path_1.default.join(runDir, "detections.jsonl");
    const stat = await promises_1.default.stat(detectionsPath);
    const cached = runCache.get(runId);
    if (cached && cached.mtimeMs === stat.mtimeMs)
        return cached;
    const content = await promises_1.default.readFile(detectionsPath, "utf8");
    const bestByTrackingId = new Map();
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        let raw;
        try {
            raw = JSON.parse(trimmed);
        }
        catch {
            continue;
        }
        const runFromRecord = raw.backup_run_id || runId;
        const capture = {
            id: `${runFromRecord}-${raw.tracking_id}`,
            runId: runFromRecord,
            trackingId: raw.tracking_id,
            label: raw.label,
            kind: (0, captures_schema_1.labelToKind)(raw.label),
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
        const shouldReplace = capture.confidence > existing.confidence ||
            (capture.confidence === existing.confidence &&
                parseTimestamp(capture.bestSeenAt) > parseTimestamp(existing.bestSeenAt));
        if (shouldReplace) {
            bestByTrackingId.set(raw.tracking_id, capture);
        }
    }
    const captures = Array.from(bestByTrackingId.values()).sort((a, b) => parseTimestamp(b.bestSeenAt) - parseTimestamp(a.bestSeenAt));
    const imageCount = await safeCountFiles(path_1.default.join(runDir, "images"));
    const metadataCount = await safeCountFiles(path_1.default.join(runDir, "metadata"));
    const run = {
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
exports.captureBackupsService = {
    rootDir: BACKUPS_DIR,
    async listRuns(limit = 5, offset = 0) {
        const runIds = await listRunIds();
        const pageIds = runIds.slice(offset, offset + limit);
        const runs = await Promise.all(pageIds.map(async (runId) => {
            try {
                return (await loadRun(runId)).run;
            }
            catch {
                return null;
            }
        }));
        const filteredRuns = runs.filter((run) => run !== null);
        const nextOffset = offset + pageIds.length < runIds.length ? offset + pageIds.length : null;
        return {
            runs: filteredRuns,
            nextOffset,
            rootDir: BACKUPS_DIR,
        };
    },
    async getRunCaptures(runId, limit = 24, offset = 0) {
        const { run, captures } = await loadRun(runId);
        const nextOffset = offset + limit < captures.length ? offset + limit : null;
        return {
            run,
            captures: captures.slice(offset, offset + limit),
            nextOffset,
        };
    },
    async listCaptures(limit = 100, offset = 0) {
        const runIds = await listRunIds();
        const loadedRuns = await Promise.all(runIds.map(async (runId) => {
            try {
                return await loadRun(runId);
            }
            catch {
                return null;
            }
        }));
        const captures = loadedRuns
            .filter((entry) => entry !== null)
            .flatMap((entry) => entry.captures)
            .sort((a, b) => parseTimestamp(b.bestSeenAt) - parseTimestamp(a.bestSeenAt));
        return {
            captures: captures.slice(offset, offset + limit),
            nextOffset: offset + limit < captures.length ? offset + limit : null,
            total: captures.length,
        };
    },
};
//# sourceMappingURL=capture-backups.service.js.map