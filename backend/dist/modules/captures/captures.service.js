"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capturesService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mongo_1 = require("../../db/mongo");
const postgres_1 = require("../../db/postgres");
const logger_1 = require("../../lib/logger");
const ws_server_1 = require("../../realtime/ws-server");
const captures_schema_1 = require("./captures.schema");
const UPLOADS_DIR = path_1.default.resolve(process.cwd(), "uploads", "captures");
const log = (0, logger_1.createLogger)("captures");
function docToCapture(doc) {
    return {
        id: String(doc._id),
        trackingId: doc.trackingId,
        farmerId: doc.farmerId ?? null,
        label: doc.label,
        kind: doc.kind ?? (0, captures_schema_1.labelToKind)(doc.label),
        confidence: doc.confidence,
        timestamp: doc.timestamp.toISOString(),
        bboxXyxy: doc.bboxXyxy,
        imageS3Uri: doc.imageS3Uri ?? null,
        imagePath: doc.imagePath ?? null,
        imageUrl: doc.imageUrl ?? null,
        lat: doc.lat ?? null,
        lng: doc.lng ?? null,
        trajectory: doc.trajectory ?? null,
    };
}
exports.capturesService = {
    /** Called by the MQTT bridge for every new detection from the Pi. */
    async ingest(payload) {
        const kind = (0, captures_schema_1.labelToKind)(payload.label);
        let imageUrl = null;
        if (payload.image_b64) {
            try {
                await promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
                const filename = `capture_${payload.tracking_id}_${Date.now()}.jpg`;
                const filepath = path_1.default.join(UPLOADS_DIR, filename);
                await promises_1.default.writeFile(filepath, Buffer.from(payload.image_b64, "base64"));
                imageUrl = `/uploads/captures/${filename}`;
            }
            catch (err) {
                log.error("Failed to save base64 image", err);
            }
        }
        const doc = await mongo_1.CaptureModel.findOneAndUpdate({ trackingId: payload.tracking_id }, {
            trackingId: payload.tracking_id,
            label: payload.label,
            kind,
            confidence: payload.confidence,
            timestamp: new Date(payload.timestamp),
            bboxXyxy: payload.bbox_xyxy,
            imageS3Uri: payload.image_s3_uri ?? null,
            imagePath: payload.image_path ?? null,
            imageUrl,
            backupRunId: payload.backup_run_id ?? null,
            farmerId: payload.farmer_id ?? null,
            lat: payload.lat ?? null,
            lng: payload.lng ?? null,
            trajectory: payload.trajectory ?? null,
        }, { upsert: true, new: true }).lean();
        const capture = docToCapture(doc);
        // Award carbon credits to the farmer when a new insect is captured
        let newBalance = null;
        if (payload.farmer_id) {
            try {
                const creditsEarned = Math.ceil(payload.confidence * 10);
                const { rows } = await postgres_1.pool.query(`UPDATE farmers
             SET carbon_credits = carbon_credits + $1
           WHERE id = $2
           RETURNING carbon_credits`, [creditsEarned, payload.farmer_id]);
                await postgres_1.pool.query(`INSERT INTO transactions (farmer_id, amount, type, description)
           VALUES ($1, $2, 'earned', $3)`, [
                    payload.farmer_id,
                    creditsEarned,
                    `Capture: ${payload.label} (confidence ${(payload.confidence * 100).toFixed(0)}%)`,
                ]);
                newBalance = rows[0]?.carbon_credits ?? null;
                log.info(`+${creditsEarned} credits to farmer ${payload.farmer_id}`);
            }
            catch (err) {
                log.warn("Could not award credits (Postgres error)", err);
            }
        }
        // Push real-time events to any connected browsers for this farm.
        // Used by BOTH the MQTT bridge and the HTTP POST /api/captures endpoint.
        try {
            (0, ws_server_1.broadcastCapture)(capture);
            if (capture.farmerId && newBalance !== null) {
                (0, ws_server_1.broadcastCreditUpdate)(capture.farmerId, newBalance);
            }
        }
        catch (err) {
            log.warn("Failed to broadcast capture via WebSocket", err);
        }
        return capture;
    },
    async getAll(filters) {
        const query = {};
        if (filters.farmerId)
            query.farmerId = filters.farmerId;
        if (filters.kind)
            query.kind = filters.kind;
        const docs = await mongo_1.CaptureModel.find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit ?? 200)
            .lean();
        return docs.map((d) => docToCapture(d));
    },
    async getById(id) {
        const doc = await mongo_1.CaptureModel.findById(id).lean();
        return doc ? docToCapture(doc) : null;
    },
    async getStats() {
        const agg = await mongo_1.CaptureModel.aggregate([
            { $group: { _id: "$kind", count: { $sum: 1 } } },
        ]);
        return Object.fromEntries(agg.map((r) => [r._id, r.count]));
    },
};
//# sourceMappingURL=captures.service.js.map