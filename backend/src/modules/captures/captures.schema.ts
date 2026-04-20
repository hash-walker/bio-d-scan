import { z } from "zod";

// What the AI model (via MQTT) sends to us
export const MqttCaptureSchema = z.preprocess((input) => {
  if (!input || typeof input !== "object") return input;
  const raw = input as Record<string, unknown>;

  // Accept both snake_case and camelCase from different Pi gateways.
  return {
    tracking_id: raw.tracking_id ?? raw.trackingId,
    label: raw.label,
    confidence: raw.confidence,
    timestamp: raw.timestamp,
    bbox_xyxy: raw.bbox_xyxy ?? raw.bboxXyxy,
    backup_run_id: raw.backup_run_id ?? raw.backupRunId,
    image_path: raw.image_path ?? raw.imagePath,
    image_s3_uri: raw.image_s3_uri ?? raw.imageS3Uri,
    image_b64: raw.image_b64 ?? raw.imageB64,
    farmer_id: raw.farmer_id ?? raw.farmerId,
    lat: raw.lat,
    lng: raw.lng,
    trajectory: raw.trajectory,
  };
}, z.object({
  tracking_id: z.coerce.number(),
  label: z.string(),
  confidence: z.coerce.number(),
  timestamp: z.string(),
  bbox_xyxy: z.array(z.coerce.number()).length(4),
  backup_run_id: z.string().optional(),
  image_path: z.string().optional(),
  image_s3_uri: z.string().optional(),
  image_b64: z.string().optional(),

  // Optional: enriched by the gateway (e.g. which farmer's device sent it)
  farmer_id: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  trajectory: z.string().optional(),
}));

export type MqttCaptureInput = z.infer<typeof MqttCaptureSchema>;

// Label → InsectKind mapping (must cover labels your YOLO model uses)
const LABEL_TO_KIND: Record<string, string> = {
  butterfly: "butterfly",
  moth: "butterfly",
  beetle: "beetle",
  ladybug: "ladybug",
  bee: "bee",
  bumblebee: "bee",
  wasp: "bee",
  firefly: "ladybug",
  dragonfly: "ladybug",
  grasshopper: "beetle",
  ant: "beetle",
};

export function labelToKind(label: string): string {
  return LABEL_TO_KIND[label.toLowerCase()] ?? "beetle";
}

// Public-facing capture shape (returned by REST API + WebSocket)
export interface Capture {
  id: string;
  trackingId: number;
  farmerId: string | null;
  label: string;
  kind: string;
  confidence: number;
  timestamp: string;
  bboxXyxy: number[];
  imageS3Uri: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  trajectory: string | null;
}
