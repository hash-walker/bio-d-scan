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
export declare function startMqttBridge(): void;
export declare function stopMqttBridge(): void;
