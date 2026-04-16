import { create } from "zustand";
import type { InsectCapture, InsectKind, Farmer } from "@/modules/shared/types";
import { MOCK_CAPTURES, MOCK_FARMERS, MOCK_TRANSACTIONS, INSECT_KINDS } from "@/lib/mock-data";
import { farmersApi, capturesApi, creditsApi, type Capture as ApiCapture } from "@/lib/api";
import { getBioScanSocket } from "@/lib/ws";

// ─── Map API response → frontend types ────────────────────────────────────────

function apiCaptureToInsect(c: ApiCapture): InsectCapture {
  const kindMeta = INSECT_KINDS.find((k) => k.kind === c.kind) ?? INSECT_KINDS[0];
  return {
    id: c.id,
    kind: (c.kind as InsectKind) ?? "beetle",
    commonName: `${c.label.charAt(0).toUpperCase()}${c.label.slice(1)} #${c.trackingId}`,
    scientificName: kindMeta?.scientificName ?? "Specimen spp.",
    timestamp: c.timestamp,
    lat: c.lat ?? 31.55,
    lng: c.lng ?? 74.34,
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
  transactions: typeof MOCK_TRANSACTIONS;
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
  farmerId: "farmer-001",  // will be replaced by real UUID after API fetch
  farmerName: MOCK_FARMERS[0].name,
  currentFarmer: null,
  captures: MOCK_CAPTURES,
  selectedKind: null,
  liveScan: { isScanning: false, lastCapture: null, recentCaptures: [] },
  carbonCredits: MOCK_FARMERS[0].carbonCredits,
  transactions: MOCK_TRANSACTIONS,
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
      const [farmers, captures] = await Promise.all([
        farmersApi.list(),
        capturesApi.list({ limit: 100 }),
      ]);

      if (farmers.length > 0) {
        const f = farmers[0];
        const currentFarmer: Farmer = {
          id: f.id,
          name: f.name,
          farmName: f.farm_name,
          location: f.location,
          coordinates: { lat: f.lat, lng: f.lng },
          fieldAreaHectares: f.field_area_ha,
          farmingMethod: f.farming_method,
          waterSource: f.water_source,
          carbonCredits: f.carbon_credits,
          totalCaptures: captures.length,
          joinedAt: f.joined_at,
          weather: f.weather,
        };
        set({
          farmerId: f.id,
          farmerName: f.name,
          carbonCredits: f.carbon_credits,
          currentFarmer,
        });

        // Fetch transactions with the real farmer ID
        const realTxns = await creditsApi.transactions(f.id).catch(() => []);
        const mappedTxns = realTxns.map((t) => ({
          id: t.id,
          farmerId: t.farmerId,
          amount: t.amount,
          type: t.type,
          description: t.description,
          timestamp: t.createdAt,
        }));
        if (mappedTxns.length > 0) {
          set({ transactions: mappedTxns });
        }
      }

      if (captures.length > 0) {
        set({ captures: captures.map(apiCaptureToInsect) });
      }

      set({ isLoading: false });
    } catch {
      // Backend offline — keep mock data, don't show error in UI
      set({ isLoading: false });
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
