import { create } from "zustand";
import { MOCK_FARMERS, MOCK_CAPTURES } from "@/lib/mock-data";
import type { Farmer } from "@/modules/shared/types";

interface GovernmentStore {
  farmers: Farmer[];
  selectedFarmerId: string | null;
  allCaptures: typeof MOCK_CAPTURES;
  creditReleaseFormula: {
    perCapture: number;
    organicBonus: number;
    transitioningBonus: number;
  };

  selectFarmer: (id: string | null) => void;
  releaseCredits: (farmerId: string, amount: number) => void;
  updateCreditFormula: (updates: Partial<GovernmentStore["creditReleaseFormula"]>) => void;

  // Derived helpers
  getOrgnaicFarmingPercent: () => number;
  getTotalCreditsIssued: () => number;
  getTotalCaptures: () => number;
}

export const useGovernmentStore = create<GovernmentStore>((set, get) => ({
  farmers: MOCK_FARMERS,
  selectedFarmerId: null,
  allCaptures: MOCK_CAPTURES,
  creditReleaseFormula: {
    perCapture: 5,
    organicBonus: 200,
    transitioningBonus: 80,
  },

  selectFarmer: (id) => set({ selectedFarmerId: id }),

  releaseCredits: (farmerId, amount) =>
    set((s) => ({
      farmers: s.farmers.map((f) =>
        f.id === farmerId ? { ...f, carbonCredits: f.carbonCredits + amount } : f
      ),
    })),

  updateCreditFormula: (updates) =>
    set((s) => ({
      creditReleaseFormula: { ...s.creditReleaseFormula, ...updates },
    })),

  getOrgnaicFarmingPercent: () => {
    const { farmers } = get();
    const organic = farmers.filter((f) => f.farmingMethod === "organic").length;
    return Math.round((organic / farmers.length) * 100);
  },

  getTotalCreditsIssued: () =>
    get().farmers.reduce((sum, f) => sum + f.carbonCredits, 0),

  getTotalCaptures: () =>
    get().farmers.reduce((sum, f) => sum + f.totalCaptures, 0),
}));
