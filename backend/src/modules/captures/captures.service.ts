import { CaptureModel } from "../../db/mongo";
import { pool } from "../../db/postgres";
import { createLogger } from "../../lib/logger";
import { labelToKind, type MqttCaptureInput, type Capture } from "./captures.schema";

const log = createLogger("captures");

function docToCapture(doc: Record<string, unknown>): Capture {
  return {
    id: String(doc._id),
    trackingId: doc.trackingId as number,
    farmerId: (doc.farmerId as string) ?? null,
    label: doc.label as string,
    kind: (doc.kind as string) ?? labelToKind(doc.label as string),
    confidence: doc.confidence as number,
    timestamp: (doc.timestamp as Date).toISOString(),
    bboxXyxy: doc.bboxXyxy as number[],
    imageS3Uri: (doc.imageS3Uri as string) ?? null,
    imagePath: (doc.imagePath as string) ?? null,
    lat: (doc.lat as number) ?? null,
    lng: (doc.lng as number) ?? null,
    trajectory: (doc.trajectory as string) ?? null,
  };
}

export const capturesService = {
  /** Called by the MQTT bridge for every new detection from the Pi. */
  async ingest(payload: MqttCaptureInput): Promise<Capture> {
    const kind = labelToKind(payload.label);

    const doc = await CaptureModel.findOneAndUpdate(
      { trackingId: payload.tracking_id },
      {
        trackingId: payload.tracking_id,
        label: payload.label,
        kind,
        confidence: payload.confidence,
        timestamp: new Date(payload.timestamp),
        bboxXyxy: payload.bbox_xyxy,
        imageS3Uri: payload.image_s3_uri ?? null,
        imagePath: payload.image_path ?? null,
        backupRunId: payload.backup_run_id ?? null,
        farmerId: payload.farmer_id ?? null,
        lat: payload.lat ?? null,
        lng: payload.lng ?? null,
        trajectory: payload.trajectory ?? null,
      },
      { upsert: true, new: true }
    ).lean();

    // Award carbon credits to the farmer when a new insect is captured
    if (payload.farmer_id) {
      try {
        const creditsEarned = Math.ceil(payload.confidence * 10);
        await pool.query(
          "UPDATE farmers SET carbon_credits = carbon_credits + $1 WHERE id = $2",
          [creditsEarned, payload.farmer_id]
        );
        await pool.query(
          `INSERT INTO transactions (farmer_id, amount, type, description)
           VALUES ($1, $2, 'earned', $3)`,
          [
            payload.farmer_id,
            creditsEarned,
            `Capture: ${payload.label} (confidence ${(payload.confidence * 100).toFixed(0)}%)`,
          ]
        );
        log.info(`+${creditsEarned} credits to farmer ${payload.farmer_id}`);
      } catch (err) {
        log.warn("Could not award credits (Postgres error)", err);
      }
    }

    return docToCapture(doc as Record<string, unknown>);
  },

  async getAll(filters: { farmerId?: string; kind?: string; limit?: number }): Promise<Capture[]> {
    const query: Record<string, unknown> = {};
    if (filters.farmerId) query.farmerId = filters.farmerId;
    if (filters.kind) query.kind = filters.kind;

    const docs = await CaptureModel.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit ?? 200)
      .lean();

    return docs.map((d) => docToCapture(d as Record<string, unknown>));
  },

  async getById(id: string): Promise<Capture | null> {
    const doc = await CaptureModel.findById(id).lean();
    return doc ? docToCapture(doc as Record<string, unknown>) : null;
  },

  async getStats(): Promise<Record<string, number>> {
    const agg = await CaptureModel.aggregate([
      { $group: { _id: "$kind", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(agg.map((r: { _id: string; count: number }) => [r._id, r.count]));
  },
};
