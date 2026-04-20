import { z } from "zod";
export declare const CreateFarmerSchema: z.ZodObject<{
    name: z.ZodString;
    farm_name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    lat: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    lng: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    field_area_ha: z.ZodNumber;
    farming_method: z.ZodEnum<["organic", "transitioning", "commercial"]>;
    water_source: z.ZodEnum<["rainFed", "irrigated", "mixed"]>;
    primary_crops: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    farm_name: string;
    location: string;
    lat: number;
    lng: number;
    field_area_ha: number;
    farming_method: "organic" | "transitioning" | "commercial";
    water_source: "rainFed" | "irrigated" | "mixed";
    phone?: string | undefined;
    primary_crops?: string | undefined;
}, {
    name: string;
    farm_name: string;
    location: string;
    field_area_ha: number;
    farming_method: "organic" | "transitioning" | "commercial";
    water_source: "rainFed" | "irrigated" | "mixed";
    phone?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    primary_crops?: string | undefined;
}>;
export type CreateFarmerInput = z.infer<typeof CreateFarmerSchema>;
export declare const UpdateFarmerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    farm_name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    field_area_ha: z.ZodOptional<z.ZodNumber>;
    farming_method: z.ZodOptional<z.ZodEnum<["organic", "transitioning", "commercial"]>>;
    water_source: z.ZodOptional<z.ZodEnum<["rainFed", "irrigated", "mixed"]>>;
    primary_crops: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    farm_name?: string | undefined;
    phone?: string | undefined;
    location?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    field_area_ha?: number | undefined;
    farming_method?: "organic" | "transitioning" | "commercial" | undefined;
    water_source?: "rainFed" | "irrigated" | "mixed" | undefined;
    primary_crops?: string | undefined;
}, {
    name?: string | undefined;
    farm_name?: string | undefined;
    phone?: string | undefined;
    location?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    field_area_ha?: number | undefined;
    farming_method?: "organic" | "transitioning" | "commercial" | undefined;
    water_source?: "rainFed" | "irrigated" | "mixed" | undefined;
    primary_crops?: string | undefined;
}>;
export type UpdateFarmerInput = z.infer<typeof UpdateFarmerSchema>;
export interface Farmer {
    id: string;
    name: string;
    farm_name: string;
    phone: string | null;
    location: string;
    lat: number;
    lng: number;
    field_area_ha: number;
    farming_method: "organic" | "transitioning" | "commercial";
    water_source: "rainFed" | "irrigated" | "mixed";
    primary_crops: string | null;
    carbon_credits: number;
    joined_at: string;
    weather: {
        temp: number;
        humidity: number;
        condition: string;
    };
}
