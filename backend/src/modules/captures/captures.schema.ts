import { z } from "zod";

// What the AI model (via MQTT) sends to us
export const MqttCaptureSchema = z.object({
  tracking_id: z.number(),
  label: z.string(),
  confidence: z.number(),
  timestamp: z.string(),
  bbox_xyxy: z.array(z.number()).length(4),
  backup_run_id: z.string().optional(),
  image_path: z.string().optional(),
  image_s3_uri: z.string().optional(),

  // Optional: enriched by the gateway (e.g. which farmer's device sent it)
  farmer_id: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  trajectory: z.string().optional(),
});

export type MqttCaptureInput = z.infer<typeof MqttCaptureSchema>;

// Label → InsectKind mapping (must cover labels your YOLO model uses)
const LABEL_TO_KIND: Record<string, string> = {
  butterfly: "butterfly",
  moth: "butterfly",
  beetle: "beetle",
  ladybug: "beetle",
  bee: "bee",
  bumblebee: "bee",
  wasp: "bee",
  firefly: "firefly",
  dragonfly: "firefly",
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
  lat: number | null;
  lng: number | null;
  trajectory: string | null;
}
