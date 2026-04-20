"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttCaptureSchema = void 0;
exports.labelToKind = labelToKind;
const zod_1 = require("zod");
// What the AI model (via MQTT) sends to us
exports.MqttCaptureSchema = zod_1.z.object({
    tracking_id: zod_1.z.number(),
    label: zod_1.z.string(),
    confidence: zod_1.z.number(),
    timestamp: zod_1.z.string(),
    bbox_xyxy: zod_1.z.array(zod_1.z.number()).length(4),
    backup_run_id: zod_1.z.string().optional(),
    image_path: zod_1.z.string().optional(),
    image_s3_uri: zod_1.z.string().optional(),
    // Optional: enriched by the gateway (e.g. which farmer's device sent it)
    farmer_id: zod_1.z.string().optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    trajectory: zod_1.z.string().optional(),
});
// Label → InsectKind mapping (must cover labels your YOLO model uses)
const LABEL_TO_KIND = {
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
function labelToKind(label) {
    return LABEL_TO_KIND[label.toLowerCase()] ?? "beetle";
}
//# sourceMappingURL=captures.schema.js.map