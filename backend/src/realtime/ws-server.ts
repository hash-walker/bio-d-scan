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

import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { createLogger } from "../lib/logger";
import { config } from "../config";

const log = createLogger("ws");

interface Client {
  ws: WebSocket;
  subscribedFarms: Set<string>;
  /** Set when this connection is from a Raspberry Pi, not the browser */
  piFor: string | null;
  /** MJPEG stream URL advertised by a Pi on PI_REGISTER */
  streamUrl: string | null;
}

const clients = new Set<Client>();

/** Look up the Pi connection for a given farm */
function getPiForFarm(farmerId: string): Client | undefined {
  for (const c of clients) {
    if (c.piFor === farmerId && c.ws.readyState === WebSocket.OPEN) return c;
  }
  return undefined;
}

export function createWsServer(server: import("http").Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const ip = req.socket.remoteAddress ?? "unknown";
    log.info(`Client connected from ${ip}`);

    const client: Client = { ws, subscribedFarms: new Set(), piFor: null, streamUrl: null };
    clients.add(client);

    // Send static live stream URL on connect (fallback for non-Pi deployments)
    if (config.liveStreamUrl) {
      send(ws, { type: "STREAM_URL", data: { url: config.liveStreamUrl, farmerId: null } });
    }

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; data?: Record<string, unknown> };
        const farmerId = msg.data?.farmerId ? String(msg.data.farmerId) : null;

        switch (msg.type) {

          // ── Browser messages ────────────────────────────────────────────────

          case "JOIN_FARM":
            if (farmerId) {
              client.subscribedFarms.add(farmerId);
              log.debug(`Browser joined farm ${farmerId}`);

              // Tell the browser whether a Pi is currently online for this farm.
              const pi = getPiForFarm(farmerId);
              if (pi) {
                send(ws, { type: "PI_STATUS", data: { online: true, farmerId } });
                if (pi.streamUrl !== null) {
                  send(ws, { type: "STREAM_URL", data: { url: pi.streamUrl, farmerId } });
                }
              } else {
                send(ws, { type: "PI_STATUS", data: { online: false, farmerId } });
              }
            }
            break;

          case "LEAVE_FARM":
            if (farmerId) client.subscribedFarms.delete(farmerId);
            break;

          case "SCAN_START":
            if (farmerId) {
              // Relay to the Pi connected for this farm
              const piClient = getPiForFarm(farmerId);
              if (piClient) {
                send(piClient.ws, { type: "SCAN_START", data: { farmerId } });
                log.info(`SCAN_START relayed to Pi for farm ${farmerId}`);
              } else {
                log.warn(`SCAN_START: no Pi connected for farm ${farmerId}`);
              }
              broadcastToFarm(farmerId, { type: "SCAN_STATUS", data: { isScanning: true, farmerId } });
            }
            break;

          case "SCAN_STOP":
            if (farmerId) {
              const piClient = getPiForFarm(farmerId);
              if (piClient) {
                send(piClient.ws, { type: "SCAN_STOP", data: { farmerId } });
                log.info(`SCAN_STOP relayed to Pi for farm ${farmerId}`);
              }
              broadcastToFarm(farmerId, { type: "SCAN_STATUS", data: { isScanning: false, farmerId } });
            }
            break;

          case "PING":
            send(ws, { type: "PONG" });
            break;

          // ── Raspberry Pi messages ───────────────────────────────────────────

          case "PI_REGISTER":
            if (farmerId) {
              client.piFor = farmerId;
              const streamUrl = msg.data?.streamUrl ? String(msg.data.streamUrl) : null;
              client.streamUrl = streamUrl;
              log.info(`Pi registered for farm ${farmerId} — stream: ${streamUrl ?? "none"}`);

              // Tell all browsers: the Pi is online and here is its stream URL.
              broadcastToFarm(farmerId, { type: "PI_STATUS", data: { online: true, farmerId } });
              broadcastToFarm(farmerId, { type: "STREAM_URL", data: { url: streamUrl || "", farmerId } });
            }
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      const wasPiFor = client.piFor;
      clients.delete(client);
      log.info(`Client disconnected from ${ip}`);

      // If this was a Pi, tell all browsers that the Pi is offline
      if (wasPiFor) {
        const stillOnline = getPiForFarm(wasPiFor);
        if (!stillOnline) {
          log.info(`Pi for farm ${wasPiFor} went offline`);
          broadcastToFarm(wasPiFor, { type: "PI_STATUS", data: { online: false, farmerId: wasPiFor } });
        }
      }
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

/** Send to all browser clients subscribed to a specific farm (skips Pi connections). */
function broadcastToFarm(farmerId: string, payload: unknown) {
  const msg = JSON.stringify(payload);
  for (const client of clients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    if (client.piFor) continue; // skip Pi connections
    if (client.subscribedFarms.has(farmerId)) {
      client.ws.send(msg);
    }
  }
}

/** Broadcast a new capture to all browser clients subscribed to that farm. */
export function broadcastCapture(capture: unknown & { farmerId?: string | null }) {
  const farmerId = (capture as { farmerId?: string | null }).farmerId;
  const payload = { type: "CAPTURE_NEW", data: capture };

  if (farmerId) {
    broadcastToFarm(farmerId, payload);
  } else {
    // No farmerId — send to all browsers
    const msg = JSON.stringify(payload);
    for (const client of clients) {
      if (client.ws.readyState !== WebSocket.OPEN || client.piFor) continue;
      client.ws.send(msg);
    }
  }
}

/** Broadcast a credit balance update to all clients watching that farmer. */
export function broadcastCreditUpdate(farmerId: string, newBalance: number) {
  broadcastToFarm(farmerId, { type: "CREDIT_UPDATE", data: { farmerId, newBalance } });
}

/** Returns how many clients are currently connected. */
export function getConnectedCount(): number {
  return clients.size;
}
