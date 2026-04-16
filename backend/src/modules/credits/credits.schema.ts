import { z } from "zod";

export const RedeemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const ReleaseSchema = z.object({
  farmerId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().optional(),
});

export type RedeemInput = z.infer<typeof RedeemSchema>;
export type ReleaseInput = z.infer<typeof ReleaseSchema>;

export interface Transaction {
  id: string;
  farmerId: string;
  amount: number;
  type: "earned" | "redeemed" | "released";
  description: string;
  createdAt: string;
}
