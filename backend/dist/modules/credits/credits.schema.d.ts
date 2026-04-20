import { z } from "zod";
export declare const RedeemSchema: z.ZodObject<{
    itemId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    itemId: string;
    quantity: number;
}, {
    itemId: string;
    quantity?: number | undefined;
}>;
export declare const ReleaseSchema: z.ZodObject<{
    farmerId: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    farmerId: string;
    amount: number;
    description?: string | undefined;
}, {
    farmerId: string;
    amount: number;
    description?: string | undefined;
}>;
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
