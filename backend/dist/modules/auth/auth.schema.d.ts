import { z } from "zod";
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RegisterFarmerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
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
    email: string;
    password: string;
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
    email: string;
    password: string;
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
export declare const RegisterGovernmentSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    department: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    department: string;
}, {
    email: string;
    password: string;
    name: string;
    department: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterFarmerInput = z.infer<typeof RegisterFarmerSchema>;
export type RegisterGovernmentInput = z.infer<typeof RegisterGovernmentSchema>;
export interface AuthUser {
    id: string;
    email: string;
    role: "farmer" | "government";
    name: string;
    department: string | null;
    farmerId: string | null;
    createdAt: string;
}
export interface AuthResponse {
    token: string;
    user: AuthUser;
}
