import { create } from "zustand";
import type { InsectCapture, InsectKind } from "@/modules/shared/types";
import { MOCK_CAPTURES, MOCK_FARMERS, MOCK_TRANSACTIONS } from "@/lib/mock-data";

interface LiveScanState {
  isScanning: boolean;
  lastCapture: InsectCapture | null;
  recentCaptures: InsectCapture[];
}

interface FarmerStore {
  farmerId: string;
  captures: InsectCapture[];
  selectedKind: InsectKind | null;
  liveScan: LiveScanState;
  carbonCredits: number;
  transactions: typeof MOCK_TRANSACTIONS;

  setSelectedKind: (kind: InsectKind | null) => void;
  startScan: () => void;
  stopScan: () => void;
  simulateCapture: () => void;
  redeemCredits: (amount: number, description: string) => void;
}

export const useFarmerStore = create<FarmerStore>((set, get) => ({
  farmerId: "farmer-001",
  captures: MOCK_CAPTURES,
  selectedKind: null,
  liveScan: {
    isScanning: false,
    lastCapture: null,
    recentCaptures: [],
  },
  carbonCredits: MOCK_FARMERS[0].carbonCredits,
  transactions: MOCK_TRANSACTIONS,

  setSelectedKind: (kind) => set({ selectedKind: kind }),

  startScan: () =>
    set((s) => ({ liveScan: { ...s.liveScan, isScanning: true } })),

  stopScan: () =>
    set((s) => ({ liveScan: { ...s.liveScan, isScanning: false } })),

  simulateCapture: () => {
    const kinds: InsectKind[] = ["butterfly", "beetle", "bee", "firefly"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const newCapture: InsectCapture = {
      id: `cap-live-${Date.now()}`,
      kind,
      commonName: `Live ${kind} #${Math.floor(Math.random() * 999)}`,
      scientificName: "Specimen spp.",
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

  redeemCredits: (amount, description) => {
    const tx = {
      id: `tx-${Date.now()}`,
      farmerId: get().farmerId,
      amount,
      type: "redeemed" as const,
      description,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      carbonCredits: s.carbonCredits - amount,
      transactions: [tx, ...s.transactions],
    }));
  },
}));
