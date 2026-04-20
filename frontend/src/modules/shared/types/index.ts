import { z } from "zod";

// ─── Insect types ────────────────────────────────────────────────────────────

export const InsectKind = z.enum(["butterfly", "beetle", "bee", "ladybug"]);
export type InsectKind = z.infer<typeof InsectKind>;

export const InsectCaptureSchema = z.object({
  id: z.string(),
  kind: InsectKind,
  commonName: z.string(),
  scientificName: z.string(),
  timestamp: z.string(),
  lat: z.number(),
  lng: z.number(),
  trajectory: z.string().optional(),
  aiConfidence: z.number().min(0).max(100),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(["live", "backup"]).optional(),
  backupRunId: z.string().optional(),
  firstSeenAt: z.string().optional(),
  bestSeenAt: z.string().optional(),
  bboxXyxy: z.array(z.number()).length(4).optional(),
  frameSize: z.array(z.number()).length(2).optional(),
  rawData: z.unknown().optional(),
});
export type InsectCapture = z.infer<typeof InsectCaptureSchema>;

// ─── Farmer types ────────────────────────────────────────────────────────────

export const FarmingMethod = z.enum(["organic", "transitioning", "commercial"]);
export type FarmingMethod = z.infer<typeof FarmingMethod>;

export const WaterSource = z.enum(["rainFed", "irrigated", "mixed"]);
export type WaterSource = z.infer<typeof WaterSource>;

export const FarmerSchema = z.object({
  id: z.string(),
  name: z.string(),
  farmName: z.string(),
  location: z.string(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }),
  fieldAreaHectares: z.number(),
  farmingMethod: FarmingMethod,
  waterSource: WaterSource,
  carbonCredits: z.number(),
  totalCaptures: z.number(),
  joinedAt: z.string(),
  weather: z.object({
    temp: z.number(),
    humidity: z.number(),
    condition: z.string(),
  }),
});
export type Farmer = z.infer<typeof FarmerSchema>;

// ─── Carbon credit types ─────────────────────────────────────────────────────

export const CreditTransactionSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  amount: z.number(),
  type: z.enum(["earned", "redeemed", "released"]),
  description: z.string(),
  timestamp: z.string(),
});
export type CreditTransaction = z.infer<typeof CreditTransactionSchema>;

export const MarketplaceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  creditCost: z.number(),
  category: z.enum(["fertilizer", "seeds", "equipment", "sensor"]),
  iconName: z.string(),
});
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
