import { z } from "zod";

export interface GovOverview {
  totalFarmers: number;
  organicFarmers: number;
  organicPercent: number;
  totalAreaHa: number;
  totalCreditsIssued: number;
  totalCaptures: number;
  capturesByKind: Record<string, number>;
}
