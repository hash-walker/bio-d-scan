/**
 * WebSocket server — the frontend connects here for real-time events.
 *
 * Message types sent TO the frontend:
 *   { type: "CAPTURE_NEW",     data: Capture }
 *   { type: "CREDIT_UPDATE",   data: { farmerId, newBalance } }
 *   { type: "SCAN_STATUS",     data: { isScanning, farmerId } }
 *   { type: "STREAM_URL",      data: { url } }
 *
 * Messages received FROM the frontend:
 *   { type: "JOIN_FARM",  data: { farmerId } }  — subscribe to a farm's events
 *   { type: "LEAVE_FARM", data: { farmerId } }
 *   { type: "PING" }
 */

import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { createLogger } from "../lib/logger";
import { config } from "../config";

const log = createLogger("ws");

// Track which farms each client is subscribed to
interface Client {
  ws: WebSocket;
  subscribedFarms: Set<string>;
}

const clients = new Set<Client>();

export function createWsServer(server: import("http").Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const ip = req.socket.remoteAddress ?? "unknown";
    log.info(`Client connected from ${ip}`);

    const client: Client = { ws, subscribedFarms: new Set() };
    clients.add(client);

    // Send live stream URL on connection (if configured)
    if (config.liveStreamUrl) {
      send(ws, { type: "STREAM_URL", data: { url: config.liveStreamUrl } });
    }

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; data?: Record<string, unknown> };

        switch (msg.type) {
          case "JOIN_FARM":
            if (msg.data?.farmerId) {
              client.subscribedFarms.add(String(msg.data.farmerId));
              log.debug(`Client joined farm ${msg.data.farmerId}`);
            }
            break;

          case "LEAVE_FARM":
            if (msg.data?.farmerId) {
              client.subscribedFarms.delete(String(msg.data.farmerId));
            }
            break;

          case "PING":
            send(ws, { type: "PONG" });
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(client);
      log.info(`Client disconnected from ${ip}`);
    });

    ws.on("error", (err) => {
      log.warn(`Client error from ${ip}`, err.message);
      clients.delete(client);
    });
  });

  log.info("WebSocket server ready at /ws");
  return wss;
}

function send(ws: WebSocket, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

/** Broadcast a new capture event to all clients subscribed to that farm (or all if no farmerId). */
export function broadcastCapture(capture: unknown & { farmerId?: string | null }) {
  const msg = JSON.stringify({ type: "CAPTURE_NEW", data: capture });

  for (const client of clients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;

    // If no farmerId on capture, broadcast to everyone
    // Otherwise only send to clients subscribed to that farm, or clients with no subscription filter
    const farmerId = capture.farmerId;
    if (!farmerId || client.subscribedFarms.size === 0 || client.subscribedFarms.has(farmerId)) {
      client.ws.send(msg);
    }
  }
}

/** Broadcast a credit balance update to all clients watching that farmer. */
export function broadcastCreditUpdate(farmerId: string, newBalance: number) {
  const msg = JSON.stringify({ type: "CREDIT_UPDATE", data: { farmerId, newBalance } });

  for (const client of clients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    if (client.subscribedFarms.size === 0 || client.subscribedFarms.has(farmerId)) {
      client.ws.send(msg);
    }
  }
}

/** Returns how many clients are currently connected. */
export function getConnectedCount(): number {
  return clients.size;
}
