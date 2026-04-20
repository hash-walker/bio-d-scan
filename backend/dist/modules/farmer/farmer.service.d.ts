import type { Farmer, CreateFarmerInput, UpdateFarmerInput } from "./farmer.schema";
export declare const farmerService: {
    create(data: CreateFarmerInput): Promise<Farmer>;
    getAll(): Promise<Farmer[]>;
    getById(id: string): Promise<Farmer>;
    update(id: string, data: UpdateFarmerInput): Promise<Farmer>;
};
