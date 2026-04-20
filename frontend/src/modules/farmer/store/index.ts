import { create } from "zustand";
import type { InsectCapture, InsectKind, Farmer, CreditTransaction } from "@/modules/shared/types";
import { INSECT_KINDS } from "@/lib/mock-data";
import {
  authApi,
  farmersApi,
  capturesApi,
  creditsApi,
  type Capture as ApiCapture,
  type BackupCapture as ApiBackupCapture,
} from "@/lib/api";
import { getBioScanSocket, STATIC_STREAM_URL } from "@/lib/ws";

// ─── Map API response → frontend types ────────────────────────────────────────

function apiCaptureToInsect(c: ApiCapture): InsectCapture {
  const normalizedKind = c.kind === "firefly" ? "ladybug" : c.kind;
  const kindMeta = INSECT_KINDS.find((k) => k.kind === normalizedKind) ?? INSECT_KINDS[0];
  const raw = (c.label ?? "detection").trim();
  const title = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Detection";
  return {
    id: c.id,
    kind: (normalizedKind as InsectKind) ?? "beetle",
    commonName: `${title} #${c.trackingId}`,
    scientificName: kindMeta?.scientificName ?? "Specimen spp.",
    timestamp: c.timestamp,
    lat: c.lat ?? 0,
    lng: c.lng ?? 0,
    aiConfidence: Math.round(c.confidence * 100),
    trajectory: c.trajectory ?? undefined,
    imageUrl: c.imageUrl ?? c.imageS3Uri ?? undefined,
    source: "live",
    bboxXyxy: c.bboxXyxy.length === 4 ? c.bboxXyxy : undefined,
  };
}

function hasUsableImage(capture: InsectCapture): boolean {
  return Boolean(capture.imageUrl && capture.imageUrl.trim());
}

function backupCaptureToInsect(
  capture: ApiBackupCapture,
  fallbackLat: number,
  fallbackLng: number
): InsectCapture {
  const normalizedKind = capture.kind === "firefly" ? "ladybug" : capture.kind;
  const kindMeta = INSECT_KINDS.find((k) => k.kind === normalizedKind) ?? INSECT_KINDS[0];
  const raw = (capture.label ?? "detection").trim();
  const title = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Detection";
  const bbox = capture.bboxXyxy.length === 4 ? `[${capture.bboxXyxy.join(", ")}]` : "n/a";
  const frame = capture.frameSize ? `${capture.frameSize[0]}x${capture.frameSize[1]}` : "unknown";

  return {
    id: capture.id,
    kind: (normalizedKind as InsectKind) ?? "beetle",
    commonName: `${title} #${capture.trackingId}`,
    scientificName: kindMeta?.scientificName ?? "Specimen spp.",
    timestamp: capture.timestamp,
    lat: fallbackLat,
    lng: fallbackLng,
    aiConfidence: Math.round(capture.confidence * 100),
    imageUrl: capture.imageUrl ?? undefined,
    source: "backup",
    backupRunId: capture.runId,
    firstSeenAt: capture.firstSeenAt,
    bestSeenAt: capture.bestSeenAt,
    bboxXyxy: capture.bboxXyxy.length === 4 ? capture.bboxXyxy : undefined,
    frameSize: capture.frameSize ?? undefined,
    rawData: capture.raw,
    notes: `Backup run ${capture.runId}. First seen ${new Date(capture.firstSeenAt).toLocaleString()}. Bounding box ${bbox}. Frame ${frame}.`,
  };
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface LiveScanState {
  isScanning: boolean;
  lastCapture: InsectCapture | null;
  recentCaptures: InsectCapture[];
}

interface FarmerStore {
  farmerId: string;
  farmerName: string;
  currentFarmer: Farmer | null;
  captures: InsectCapture[];
  selectedKind: InsectKind | null;
  liveScan: LiveScanState;
  carbonCredits: number;
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  liveStreamUrl: string | null;
  /** Base64-encoded JPEG frame relayed from Pi through the backend WS */
  videoFrame: string | null;
  /** True when the browser's WebSocket to the backend is open */
  wsConnected: boolean;
  /** True when a Raspberry Pi has registered for this farmer's farm */
  piConnected: boolean;

  setSelectedKind: (kind: InsectKind | null) => void;
  startScan: () => void;
  stopScan: () => void;
  simulateCapture: () => void;
  redeemCredits: (itemId: string, amount: number, description: string) => Promise<void>;
  fetchFarmerData: () => Promise<void>;
  initWebSocket: () => () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFarmerStore = create<FarmerStore>((set, get) => ({
  farmerId: "",
  farmerName: "",
  currentFarmer: null,
  captures: [],
  selectedKind: null,
  liveScan: { isScanning: false, lastCapture: null, recentCaptures: [] },
  carbonCredits: 0,
  transactions: [],
  isLoading: false,
  error: null,
  liveStreamUrl: STATIC_STREAM_URL || null,
  videoFrame: null,
  wsConnected: false,
  piConnected: false,

  setSelectedKind: (kind) => set({ selectedKind: kind }),

  startScan: () => {
    const { farmerId } = get();
    try {
      const socket = getBioScanSocket();
      socket.startScan(farmerId);
    } catch {
      // WS not available — still update local state for simulation
    }
    set((s) => ({ liveScan: { ...s.liveScan, isScanning: true } }));
  },

  stopScan: () => {
    const { farmerId } = get();
    try {
      const socket = getBioScanSocket();
      socket.stopScan(farmerId);
    } catch {
      // WS not available
    }
    set((s) => ({ liveScan: { ...s.liveScan, isScanning: false } }));
  },

  // Visual-only simulation for demo/offline mode — does NOT touch real captures
  // or credit balance so real data stays clean.
  simulateCapture: () => {
    const kinds: InsectKind[] = ["butterfly", "beetle", "bee", "ladybug"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const kindMeta = INSECT_KINDS.find((k) => k.kind === kind) ?? INSECT_KINDS[0];
    const fakeCapture: InsectCapture = {
      id: `sim-${Date.now()}`,
      kind,
      commonName: `${kind.charAt(0).toUpperCase() + kind.slice(1)} #${Math.floor(Math.random() * 999)}`,
      scientificName: kindMeta?.scientificName ?? "Specimen spp.",
      timestamp: new Date().toISOString(),
      lat: 0,
      lng: 0,
      aiConfidence: 80 + Math.random() * 18,
      trajectory: `${["N", "NE", "E", "SE", "S"][Math.floor(Math.random() * 5)]} @ ${(Math.random() * 15 + 1).toFixed(1)} km/h`,
    };
    // Only update liveScan — never real captures or credits
    set((s) => ({
      liveScan: {
        ...s.liveScan,
        lastCapture: fakeCapture,
        recentCaptures: [fakeCapture, ...s.liveScan.recentCaptures].slice(0, 5),
      },
    }));
  },

  redeemCredits: async (itemId, amount, description) => {
    const { farmerId } = get();
    try {
      const result = await creditsApi.redeem(farmerId, itemId);
      const tx = {
        id: `tx-${Date.now()}`,
        farmerId,
        amount,
        type: "redeemed" as const,
        description,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        carbonCredits: result.newBalance,
        transactions: [tx, ...s.transactions],
      }));
    } catch {
      // Fallback: optimistic local update when backend is offline
      const tx = {
        id: `tx-${Date.now()}`,
        farmerId,
        amount,
        type: "redeemed" as const,
        description,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        carbonCredits: s.carbonCredits - amount,
        transactions: [tx, ...s.transactions],
      }));
    }
  },

  fetchFarmerData: async () => {
    set({ isLoading: true, error: null });
    try {
      const me = await authApi.me();
      if (me.role !== "farmer" || !me.farmerId) {
        set({
          isLoading: false,
          error: "No farmer profile is linked to this account.",
        });
        return;
      }

      const [f, captures, balanceRes] = await Promise.all([
        farmersApi.get(me.farmerId),
        capturesApi.list({ farmerId: me.farmerId, limit: 200 }).catch(() => []),
        creditsApi.balance(me.farmerId).catch(() => null),
      ]);

      const backupCapturesResponse = await capturesApi
        .backupCaptures({ limit: 300 })
        .catch(() => ({ captures: [], nextOffset: null, total: 0 }));

      const mergedCaptures = [
        ...captures.map(apiCaptureToInsect),
        ...backupCapturesResponse.captures.map((capture) =>
          backupCaptureToInsect(capture, f.lat, f.lng)
        ),
      ]
        .filter(hasUsableImage)
        .filter(
          (capture, index, all) =>
            all.findIndex((item) => item.id === capture.id) === index
        )
        .sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

      const currentFarmer: Farmer = {
        id: f.id,
        name: f.name,
        farmName: f.farm_name,
        location: f.location,
        coordinates: { lat: f.lat, lng: f.lng },
        fieldAreaHectares: f.field_area_ha,
        farmingMethod: f.farming_method,
        waterSource: f.water_source,
        carbonCredits: balanceRes?.balance ?? f.carbon_credits,
        totalCaptures: mergedCaptures.length,
        joinedAt: f.joined_at,
        weather: f.weather,
      };

      const realTxns = await creditsApi.transactions(f.id).catch(() => []);
      const mappedTxns: CreditTransaction[] = realTxns.map((t) => ({
        id: t.id,
        farmerId: t.farmerId,
        amount: t.amount,
        type: t.type,
        description: t.description,
        timestamp: t.createdAt,
      }));

      set({
        farmerId: f.id,
        farmerName: f.name,
        carbonCredits: balanceRes?.balance ?? f.carbon_credits,
        currentFarmer,
        captures: mergedCaptures,
        transactions: mappedTxns,
        isLoading: false,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not load your farm data. Check your connection and try again.";
      set({ isLoading: false, error: msg });
    }
  },

  /** Connect to backend WebSocket. Returns a cleanup function. */
  initWebSocket: () => {
    const socket = getBioScanSocket();
    const farmerId = get().farmerId;

    // Track backend WS connection health. Also (re-)join our farm every time
    // the socket opens — crucial because `send()` silently drops messages if
    // the socket isn't OPEN yet, and because we auto-reconnect on drops.
    const offOpen = socket.on("open", () => {
      set({ wsConnected: true });
      socket.joinFarm(farmerId);
    });
    const offClose = socket.on("close", () => set({ wsConnected: false, piConnected: false }));

    socket.connect();
    // If the singleton was already open from a previous mount, fire JOIN_FARM now
    // (the "open" event won't re-emit for an already-open socket).
    if (socket.isConnected) {
      set({ wsConnected: true });
      socket.joinFarm(farmerId);
    }

    // Real-time captures — only this farm's events arrive (server filters by farmerId)
    const offCapture = socket.on("CAPTURE_NEW", (data) => {
      const capture = apiCaptureToInsect(data as ApiCapture);
      if (!hasUsableImage(capture)) return;
      set((s) => ({
        captures: [capture, ...s.captures],
        liveScan: {
          ...s.liveScan,
          lastCapture: capture,
          recentCaptures: [capture, ...s.liveScan.recentCaptures].slice(0, 5),
        },
      }));
    });

    // Credit balance update — scoped to this farmer
    const offCredit = socket.on("CREDIT_UPDATE", (data) => {
      const { newBalance } = data as { farmerId: string; newBalance: number };
      set({ carbonCredits: newBalance });
    });

    // Pi registered → stream URL pushed here (fallback for direct MJPEG)
    const offStream = socket.on("STREAM_URL", (data) => {
      const { url, farmerId: streamFarmerId } = data as { url: string; farmerId: string | null };
      if (!streamFarmerId || streamFarmerId === get().farmerId) {
        set({ liveStreamUrl: url || null });
      }
    });

    // Video frame relay — Pi sends JPEG frames through backend WS
    const offVideoFrame = socket.on("VIDEO_FRAME", (data) => {
      const { frame, farmerId: frameFarmerId } = data as { frame: string; farmerId: string };
      if (!frameFarmerId || frameFarmerId === get().farmerId) {
        set({ videoFrame: `data:image/jpeg;base64,${frame}` });
      }
    });

    // Pi online/offline status — decoupled from stream URL
    const offPiStatus = socket.on("PI_STATUS", (data) => {
      const { online, farmerId: piFarmerId } = data as { online: boolean; farmerId: string };
      if (!piFarmerId || piFarmerId === get().farmerId) {
        set({ piConnected: online });
        if (!online) {
          set({ liveStreamUrl: null, videoFrame: null });
        }
      }
    });

    // Pi scan state relayed back from the backend
    const offScanStatus = socket.on("SCAN_STATUS", (data) => {
      const { isScanning } = data as { isScanning: boolean; farmerId: string };
      set((s) => ({ liveScan: { ...s.liveScan, isScanning } }));
    });

    return () => {
      offOpen();
      offClose();
      offCapture();
      offCredit();
      offStream();
      offVideoFrame();
      offPiStatus();
      offScanStatus();
      socket.leaveFarm(farmerId);
      set({ wsConnected: false, piConnected: false, videoFrame: null });
    };
  },
}));
