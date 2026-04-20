import type { RedeemInput, ReleaseInput, Transaction } from "./credits.schema";
export declare const creditsService: {
    getBalance(farmerId: string): Promise<number>;
    getTransactions(farmerId: string): Promise<Transaction[]>;
    redeem(farmerId: string, input: RedeemInput): Promise<{
        newBalance: number;
    }>;
    /** Government releases credits to a farmer. */
    release(input: ReleaseInput): Promise<{
        newBalance: number;
    }>;
    getMarketplaceItems(): Promise<any[]>;
};
