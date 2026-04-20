import type { GovOverview } from "./gov.schema";
export declare const govService: {
    getOverview(): Promise<GovOverview>;
    getFarmerDetails(farmerId: string): Promise<{
        farmer: any;
        transactions: any[];
        captures: import("../captures/captures.schema").Capture[];
    } | null>;
};
