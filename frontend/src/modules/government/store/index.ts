import { create } from "zustand";
import { MOCK_FARMERS, MOCK_CAPTURES, INSECT_KINDS } from "@/lib/mock-data";
import type { Farmer, InsectCapture, InsectKind } from "@/modules/shared/types";
import { farmersApi, govApi, creditsApi, capturesApi, type Farmer as ApiFarmer, type Capture as ApiCapture } from "@/lib/api";

// ─── API → frontend type mappers ──────────────────────────────────────────────

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

function apiFarmerToFrontend(f: ApiFarmer): Farmer {
  return {
    id: f.id,
    name: f.name,
    farmName: f.farm_name,
    location: f.location,
    coordinates: { lat: f.lat, lng: f.lng },
    fieldAreaHectares: f.field_area_ha,
    farmingMethod: f.farming_method,
    waterSource: f.water_source,
    carbonCredits: f.carbon_credits,
    totalCaptures: 0,  // populated from captures aggregation
    joinedAt: f.joined_at,
    weather: f.weather,
  };
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface GovernmentStore {
  farmers: Farmer[];
  selectedFarmerId: string | null;
  allCaptures: InsectCapture[];
  isLoading: boolean;
  error: string | null;
  overview: {
    totalFarmers: number;
    organicFarmers: number;
    organicPercent: number;
    totalAreaHa: number;
    totalCreditsIssued: number;
    totalCaptures: number;
    capturesByKind: Record<string, number>;
  } | null;
  creditReleaseFormula: {
    perCapture: number;
    organicBonus: number;
    transitioningBonus: number;
  };

  selectFarmer: (id: string | null) => void;
  releaseCredits: (farmerId: string, amount: number) => Promise<void>;
  updateCreditFormula: (updates: Partial<GovernmentStore["creditReleaseFormula"]>) => void;
  fetchAllData: () => Promise<void>;

  // Derived helpers (kept for compatibility)
  getOrgnaicFarmingPercent: () => number;
  getTotalCreditsIssued: () => number;
  getTotalCaptures: () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGovernmentStore = create<GovernmentStore>((set, get) => ({
  farmers: MOCK_FARMERS,
  selectedFarmerId: null,
  allCaptures: MOCK_CAPTURES,
  isLoading: false,
  error: null,
  overview: null,
  creditReleaseFormula: {
    perCapture: 5,
    organicBonus: 200,
    transitioningBonus: 80,
  },

  selectFarmer: (id) => set({ selectedFarmerId: id }),

  releaseCredits: async (farmerId, amount) => {
    try {
      await creditsApi.release(farmerId, amount);
      // Update local farmer balance
      set((s) => ({
        farmers: s.farmers.map((f) =>
          f.id === farmerId ? { ...f, carbonCredits: f.carbonCredits + amount } : f
        ),
        overview: s.overview
          ? { ...s.overview, totalCreditsIssued: s.overview.totalCreditsIssued + amount }
          : null,
      }));
    } catch {
      // Offline fallback — optimistic update
      set((s) => ({
        farmers: s.farmers.map((f) =>
          f.id === farmerId ? { ...f, carbonCredits: f.carbonCredits + amount } : f
        ),
      }));
    }
  },

  updateCreditFormula: (updates) =>
    set((s) => ({
      creditReleaseFormula: { ...s.creditReleaseFormula, ...updates },
    })),

  fetchAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [apiFarmers, capturesList, overviewData] = await Promise.all([
        farmersApi.list(),
        capturesApi.list({ limit: 500 }).catch(() => [] as ApiCapture[]),
        govApi.overview().catch(() => null),
      ]);

      // Build per-farmer capture count from MongoDB captures list
      const captureCountByFarmer: Record<string, number> = {};
      capturesList.forEach((c) => {
        if (c.farmerId) {
          captureCountByFarmer[c.farmerId] = (captureCountByFarmer[c.farmerId] ?? 0) + 1;
        }
      });

      if (apiFarmers.length > 0) {
        set({
          farmers: apiFarmers.map((f) => ({
            ...apiFarmerToFrontend(f),
            totalCaptures: captureCountByFarmer[f.id] ?? 0,
          })),
        });
      }

      if (capturesList.length > 0) {
        set({ allCaptures: capturesList.map(apiCaptureToInsect) });
      }

      if (overviewData) {
        set({ overview: overviewData });
      }

      set({ isLoading: false });
    } catch {
      // Keep mock data when backend is offline
      set({ isLoading: false });
    }
  },

  // ─── Derived helpers ────────────────────────────────────────────────────────

  getOrgnaicFarmingPercent: () => {
    const { overview, farmers } = get();
    if (overview) return overview.organicPercent;
    const organic = farmers.filter((f) => f.farmingMethod === "organic").length;
    return Math.round((organic / (farmers.length || 1)) * 100);
  },

  getTotalCreditsIssued: () => {
    const { overview, farmers } = get();
    if (overview) return overview.totalCreditsIssued;
    return farmers.reduce((sum, f) => sum + f.carbonCredits, 0);
  },

  getTotalCaptures: () => {
    const { overview, farmers } = get();
    if (overview) return overview.totalCaptures;
    return farmers.reduce((sum, f) => sum + f.totalCaptures, 0);
  },
}));
