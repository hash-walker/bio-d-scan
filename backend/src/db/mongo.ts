import mongoose from "mongoose";
import { config } from "../config";
import { createLogger } from "../lib/logger";

const log = createLogger("mongo");

// ─── Capture schema ───────────────────────────────────────────────────────────
// Matches the payload emitted by detection.py published to AWS IoT MQTT.
const captureSchema = new mongoose.Schema(
  {
    // From MQTT payload
    trackingId: { type: Number, required: true },
    label: { type: String, required: true },          // e.g. "butterfly"
    confidence: { type: Number, required: true },
    bboxXyxy: { type: [Number], required: true },     // [x1, y1, x2, y2]
    imageS3Uri: { type: String, default: null },
    imagePath: { type: String, default: null },
    imageUrl: { type: String, default: null },
    backupRunId: { type: String, default: null },

    // Enriched by backend
    farmerId: { type: String, default: null },        // which farm this belongs to
    kind: { type: String, default: null },            // mapped from label
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    trajectory: { type: String, default: null },

    timestamp: { type: Date, required: true },
  },
  {
    timestamps: true,  // adds createdAt / updatedAt
    collection: "captures",
  }
);

captureSchema.index({ farmerId: 1, timestamp: -1 });
captureSchema.index({ kind: 1 });
captureSchema.index({ trackingId: 1, backupRunId: 1 }, { unique: true });

export const CaptureModel = mongoose.model("Capture", captureSchema);

// ─── Connection ───────────────────────────────────────────────────────────────
export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(config.db.mongo);
    log.info("MongoDB connected");
  } catch (err) {
    log.error("MongoDB connection failed", err);
    throw err;
  }
}
