/**
 * WebSocket client singleton for real-time events from the backend.
 *
 * Usage:
 *   const ws = getBioScanSocket();
 *   ws.on("CAPTURE_NEW", (capture) => { ... });
 *   ws.joinFarm("farmer-id");
 */

type EventType =
  | "CAPTURE_NEW"
  | "CREDIT_UPDATE"
  | "SCAN_STATUS"
  | "STREAM_URL"
  | "PONG"
  | "open"
  | "close"
  | "error";

type Listener = (data: unknown) => void;

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

class BioScanSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<EventType, Set<Listener>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  connect(): void {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) return;

    this.intentionalClose = false;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.emit("open", null);
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: EventType; data: unknown };
        this.emit(msg.type, msg.data);
      } catch {
        // Ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.emit("close", null);
      if (!this.intentionalClose) {
        // Auto-reconnect after 3 seconds
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = (err) => {
      this.emit("error", err);
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  on(event: EventType, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: EventType, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: EventType, data: unknown): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }

  private send(payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  joinFarm(farmerId: string): void {
    this.send({ type: "JOIN_FARM", data: { farmerId } });
  }

  leaveFarm(farmerId: string): void {
    this.send({ type: "LEAVE_FARM", data: { farmerId } });
  }

  ping(): void {
    this.send({ type: "PING" });
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton — reused across the entire Next.js app (client-side only)
let _socket: BioScanSocket | null = null;

export function getBioScanSocket(): BioScanSocket {
  if (typeof window === "undefined") {
    throw new Error("getBioScanSocket() must only be called on the client side");
  }
  if (!_socket) _socket = new BioScanSocket();
  return _socket;
}
