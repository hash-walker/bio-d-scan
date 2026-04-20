"use strict";
/**
 * MQTT Bridge — subscribes to the AWS IoT MQTT topic where the
 * Raspberry Pi AI model publishes insect detection events.
 *
 * Flow:
 *   Hailo YOLOv8 (Pi) → AWS IoT MQTT → this bridge
 *                                          ↓
 *                                    MongoDB (store)
 *                                    Postgres (credits)
 *                                    WebSocket (broadcast to frontend)
 *
 * Certificates must be downloaded from the AWS IoT console for the
 * "Thing" you register for this backend process.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMqttBridge = startMqttBridge;
exports.stopMqttBridge = stopMqttBridge;
const mqtt_1 = __importDefault(require("mqtt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const logger_1 = require("../lib/logger");
const captures_schema_1 = require("../modules/captures/captures.schema");
const captures_service_1 = require("../modules/captures/captures.service");
const log = (0, logger_1.createLogger)("mqtt");
let mqttClient = null;
function resolvePath(p) {
    return path_1.default.isAbsolute(p) ? p : path_1.default.join(__dirname, "../../", p);
}
function startMqttBridge() {
    const endpoint = config_1.config.aws.iotEndpoint;
    if (!endpoint) {
        log.warn("AWS_IOT_ENDPOINT not set — MQTT bridge is DISABLED.");
        log.warn("The AI model's detections will not flow in until you configure it.");
        log.warn("You can still POST to /api/captures to ingest events manually.");
        return;
    }
    const certPath = resolvePath(config_1.config.aws.iotCertPath);
    const keyPath = resolvePath(config_1.config.aws.iotKeyPath);
    const caPath = resolvePath(config_1.config.aws.iotCaPath);
    if (!fs_1.default.existsSync(certPath) || !fs_1.default.existsSync(keyPath) || !fs_1.default.existsSync(caPath)) {
        log.warn("AWS IoT certificates not found at configured paths — MQTT bridge disabled.");
        log.warn(`Expected: ${certPath}, ${keyPath}, ${caPath}`);
        return;
    }
    const url = `mqtts://${endpoint}:8883`;
    log.info(`Connecting to AWS IoT MQTT: ${url}`);
    mqttClient = mqtt_1.default.connect(url, {
        key: fs_1.default.readFileSync(keyPath),
        cert: fs_1.default.readFileSync(certPath),
        ca: fs_1.default.readFileSync(caPath),
        protocolVersion: 5,
        clientId: `bioscan-backend-${Date.now()}`,
        reconnectPeriod: 5000,
    });
    mqttClient.on("connect", () => {
        log.info("MQTT connected to AWS IoT");
        mqttClient.subscribe(config_1.config.aws.iotTopic, { qos: 1 }, (err) => {
            if (err) {
                log.error("MQTT subscribe failed", err);
            }
            else {
                log.info(`Subscribed to topic: ${config_1.config.aws.iotTopic}`);
            }
        });
    });
    mqttClient.on("message", async (topic, raw) => {
        try {
            const payload = JSON.parse(raw.toString());
            log.debug(`MQTT message on ${topic}`, payload);
            const parsed = captures_schema_1.MqttCaptureSchema.safeParse(payload);
            if (!parsed.success) {
                log.warn("Invalid MQTT payload", parsed.error.errors);
                return;
            }
            // Save to MongoDB + award Postgres credits + broadcast to WS clients
            // (all handled inside capturesService.ingest, so both MQTT and HTTP paths behave identically)
            const capture = await captures_service_1.capturesService.ingest(parsed.data);
            log.info(`Ingested capture: ${capture.label} (${(capture.confidence * 100).toFixed(0)}%)`);
        }
        catch (err) {
            log.error("Failed to process MQTT message", err);
        }
    });
    mqttClient.on("reconnect", () => log.info("MQTT reconnecting…"));
    mqttClient.on("offline", () => log.warn("MQTT offline"));
    mqttClient.on("error", (err) => log.error("MQTT error", err.message));
}
function stopMqttBridge() {
    if (mqttClient) {
        mqttClient.end(true);
        mqttClient = null;
        log.info("MQTT bridge stopped");
    }
}
//# sourceMappingURL=mqtt-bridge.js.map