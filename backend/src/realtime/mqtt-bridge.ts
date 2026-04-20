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

import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import { config } from "../config";
import { createLogger } from "../lib/logger";
import { MqttCaptureSchema } from "../modules/captures/captures.schema";
import { capturesService } from "../modules/captures/captures.service";

const log = createLogger("mqtt");

let mqttClient: mqtt.MqttClient | null = null;

function resolvePath(p: string): string {
  return path.isAbsolute(p) ? p : path.join(__dirname, "../../", p);
}

export function startMqttBridge(): void {
  const endpoint = config.aws.iotEndpoint;

  if (!endpoint) {
    log.warn("AWS_IOT_ENDPOINT not set — MQTT bridge is DISABLED.");
    log.warn("The AI model's detections will not flow in until you configure it.");
    log.warn("You can still POST to /api/captures to ingest events manually.");
    return;
  }

  const certPath = resolvePath(config.aws.iotCertPath);
  const keyPath = resolvePath(config.aws.iotKeyPath);
  const caPath = resolvePath(config.aws.iotCaPath);

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath) || !fs.existsSync(caPath)) {
    log.warn("AWS IoT certificates not found at configured paths — MQTT bridge disabled.");
    log.warn(`Expected: ${certPath}, ${keyPath}, ${caPath}`);
    return;
  }

  const url = `mqtts://${endpoint}:8883`;
  log.info(`Connecting to AWS IoT MQTT: ${url}`);

  mqttClient = mqtt.connect(url, {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    ca: fs.readFileSync(caPath),
    protocolVersion: 5,
    clientId: `bioscan-backend-${Date.now()}`,
    reconnectPeriod: 5000,
  });

  mqttClient.on("connect", () => {
    log.info("MQTT connected to AWS IoT");

    mqttClient!.subscribe(config.aws.iotTopic, { qos: 1 }, (err) => {
      if (err) {
        log.error("MQTT subscribe failed", err);
      } else {
        log.info(`Subscribed to topic: ${config.aws.iotTopic}`);
      }
    });
  });

  mqttClient.on("message", async (topic, raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      log.debug(`MQTT message on ${topic}`, payload);

      const parsed = MqttCaptureSchema.safeParse(payload);
      if (!parsed.success) {
        log.warn("Invalid MQTT payload", parsed.error.errors);
        return;
      }

      // Save to MongoDB + award Postgres credits + broadcast to WS clients
      // (all handled inside capturesService.ingest, so both MQTT and HTTP paths behave identically)
      const capture = await capturesService.ingest(parsed.data);

      log.info(`Ingested capture: ${capture.label} (${(capture.confidence * 100).toFixed(0)}%)`);
    } catch (err) {
      log.error("Failed to process MQTT message", err);
    }
  });

  mqttClient.on("reconnect", () => log.info("MQTT reconnecting…"));
  mqttClient.on("offline", () => log.warn("MQTT offline"));
  mqttClient.on("error", (err) => log.error("MQTT error", err.message));
}

export function stopMqttBridge(): void {
  if (mqttClient) {
    mqttClient.end(true);
    mqttClient = null;
    log.info("MQTT bridge stopped");
  }
}
