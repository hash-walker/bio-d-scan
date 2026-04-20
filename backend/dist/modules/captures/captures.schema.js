"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttCaptureSchema = void 0;
exports.labelToKind = labelToKind;
const zod_1 = require("zod");
// What the AI model (via MQTT) sends to us
exports.MqttCaptureSchema = zod_1.z.preprocess((input) => {
    if (!input || typeof input !== "object")
        return input;
    const raw = input;
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
}, zod_1.z.object({
    tracking_id: zod_1.z.coerce.number(),
    label: zod_1.z.string(),
    confidence: zod_1.z.coerce.number(),
    timestamp: zod_1.z.string(),
    bbox_xyxy: zod_1.z.array(zod_1.z.coerce.number()).length(4),
    backup_run_id: zod_1.z.string().optional(),
    image_path: zod_1.z.string().optional(),
    image_s3_uri: zod_1.z.string().optional(),
    image_b64: zod_1.z.string().optional(),
    // Optional: enriched by the gateway (e.g. which farmer's device sent it)
    farmer_id: zod_1.z.string().optional(),
    lat: zod_1.z.coerce.number().optional(),
    lng: zod_1.z.coerce.number().optional(),
    trajectory: zod_1.z.string().optional(),
}));
// Label → InsectKind mapping (must cover labels your YOLO model uses)
const LABEL_TO_KIND = {
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
function labelToKind(label) {
    return LABEL_TO_KIND[label.toLowerCase()] ?? "beetle";
}
//# sourceMappingURL=captures.schema.js.map