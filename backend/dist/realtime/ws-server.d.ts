/**
 * WebSocket server — the frontend AND the Raspberry Pi connect here.
 *
 * Messages TO the frontend:
 *   { type: "CAPTURE_NEW",   data: Capture }
 *   { type: "CREDIT_UPDATE", data: { farmerId, newBalance } }
 *   { type: "SCAN_STATUS",   data: { isScanning, farmerId } }
 *   { type: "STREAM_URL",    data: { url, farmerId } }
 *
 * Messages FROM the frontend:
 *   { type: "JOIN_FARM",   data: { farmerId } }
 *   { type: "LEAVE_FARM",  data: { farmerId } }
 *   { type: "SCAN_START",  data: { farmerId } }   ← relayed to Pi for that farm
 *   { type: "SCAN_STOP",   data: { farmerId } }   ← relayed to Pi for that farm
 *   { type: "PING" }
 *
 * Messages FROM the Raspberry Pi:
 *   { type: "PI_REGISTER", data: { farmerId, streamUrl } }  ← Pi announces itself
 */
import { WebSocketServer } from "ws";
export declare function createWsServer(server: import("http").Server): WebSocketServer;
/** Broadcast a new capture to all browser clients subscribed to that farm. */
export declare function broadcastCapture(capture: unknown & {
    farmerId?: string | null;
}): void;
/** Broadcast a credit balance update to all clients watching that farmer. */
export declare function broadcastCreditUpdate(farmerId: string, newBalance: number): void;
/** Returns how many clients are currently connected. */
export declare function getConnectedCount(): number;
