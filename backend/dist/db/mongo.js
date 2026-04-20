"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureModel = void 0;
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const logger_1 = require("../lib/logger");
const log = (0, logger_1.createLogger)("mongo");
// ─── Capture schema ───────────────────────────────────────────────────────────
// Matches the payload emitted by detection.py published to AWS IoT MQTT.
const captureSchema = new mongoose_1.default.Schema({
    // From MQTT payload
    trackingId: { type: Number, required: true },
    label: { type: String, required: true }, // e.g. "butterfly"
    confidence: { type: Number, required: true },
    bboxXyxy: { type: [Number], required: true }, // [x1, y1, x2, y2]
    imageS3Uri: { type: String, default: null },
    imagePath: { type: String, default: null },
    imageUrl: { type: String, default: null },
    backupRunId: { type: String, default: null },
    // Enriched by backend
    farmerId: { type: String, default: null }, // which farm this belongs to
    kind: { type: String, default: null }, // mapped from label
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    trajectory: { type: String, default: null },
    timestamp: { type: Date, required: true },
}, {
    timestamps: true, // adds createdAt / updatedAt
    collection: "captures",
});
captureSchema.index({ farmerId: 1, timestamp: -1 });
captureSchema.index({ kind: 1 });
captureSchema.index({ trackingId: 1 }, { unique: true });
exports.CaptureModel = mongoose_1.default.model("Capture", captureSchema);
// ─── Connection ───────────────────────────────────────────────────────────────
async function connectMongo() {
    try {
        await mongoose_1.default.connect(config_1.config.db.mongo);
        log.info("MongoDB connected");
    }
    catch (err) {
        log.error("MongoDB connection failed", err);
        throw err;
    }
}
//# sourceMappingURL=mongo.js.map