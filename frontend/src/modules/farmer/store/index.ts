import { create } from "zustand";
import type { InsectCapture, InsectKind, Farmer, CreditTransaction } from "@/modules/shared/types";
import { INSECT_KINDS } from "@/lib/mock-data";
import {
  authApi,
  farmersApi,
  capturesApi,
  creditsApi,
  type Capture as ApiCapture,
} from "@/lib/api";
import { getBioScanSocket } from "@/lib/ws";

// ─── Map API response → frontend types ────────────────────────────────────────

function apiCaptureToInsect(c: ApiCapture): InsectCapture {
  const kindMeta = INSECT_KINDS.find((k) => k.kind === c.kind) ?? INSECT_KINDS[0];
  const raw = (c.label ?? "detection").trim();
  const title = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Detection";
  return {
    id: c.id,
    kind: (c.kind as InsectKind) ?? "beetle",
    commonName: `${title} #${c.trackingId}`,
    scientificName: kindMeta?.scientificName ?? "Specimen spp.",
    timestamp: c.timestamp,
    lat: c.lat ?? 0,
    lng: c.lng ?? 0,
    aiConfidence: Math.round(c.confidence * 100),
    trajectory: c.trajectory ?? undefined,
    imageUrl: c.imageS3Uri ?? undefined,
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
  liveStreamUrl: null,

  setSelectedKind: (kind) => set({ selectedKind: kind }),

  startScan: () =>
    set((s) => ({ liveScan: { ...s.liveScan, isScanning: true } })),

  stopScan: () =>
    set((s) => ({ liveScan: { ...s.liveScan, isScanning: false } })),

  // Used as fallback when backend / AI model is offline
  simulateCapture: () => {
    const kinds: InsectKind[] = ["butterfly", "beetle", "bee", "firefly"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const kindMeta = INSECT_KINDS.find((k) => k.kind === kind) ?? INSECT_KINDS[0];
    const newCapture: InsectCapture = {
      id: `cap-live-${Date.now()}`,
      kind,
      commonName: `Live ${kind} #${Math.floor(Math.random() * 999)}`,
      scientificName: kindMeta?.scientificName ?? "Specimen spp.",
      timestamp: new Date().toISOString(),
      lat: 31.55 + Math.random() * 0.02,
      lng: 74.34 + Math.random() * 0.02,
      aiConfidence: 80 + Math.random() * 18,
      trajectory: `${["N", "NE", "E", "SE", "S"][Math.floor(Math.random() * 5)]} @ ${(Math.random() * 15 + 1).toFixed(1)} km/h`,
    };
    const creditsEarned = Math.floor(Math.random() * 20) + 5;
    set((s) => ({
      captures: [newCapture, ...s.captures],
      carbonCredits: s.carbonCredits + creditsEarned,
      liveScan: {
        ...s.liveScan,
        lastCapture: newCapture,
        recentCaptures: [newCapture, ...s.liveScan.recentCaptures].slice(0, 5),
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
        capturesApi.list({ farmerId: me.farmerId, limit: 200 }),
        creditsApi.balance(me.farmerId).catch(() => null),
      ]);

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
        totalCaptures: captures.length,
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
        captures: captures.map(apiCaptureToInsect),
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
    socket.connect();

    const farmerId = get().farmerId;
    socket.joinFarm(farmerId);

    // Listen for real-time captures from the AI model
    const offCapture = socket.on("CAPTURE_NEW", (data) => {
      const capture = apiCaptureToInsect(data as ApiCapture);
      set((s) => ({
        captures: [capture, ...s.captures],
        liveScan: {
          ...s.liveScan,
          lastCapture: capture,
          recentCaptures: [capture, ...s.liveScan.recentCaptures].slice(0, 5),
        },
      }));
    });

    // Live credit balance updates
    const offCredit = socket.on("CREDIT_UPDATE", (data) => {
      const { newBalance } = data as { farmerId: string; newBalance: number };
      set({ carbonCredits: newBalance });
    });

    // Live stream URL from the Pi
    const offStream = socket.on("STREAM_URL", (data) => {
      const { url } = data as { url: string };
      set({ liveStreamUrl: url });
    });

    return () => {
      offCapture();
      offCredit();
      offStream();
      socket.leaveFarm(farmerId);
    };
  },
}));
