import { z } from "zod";

export const CreateFarmerSchema = z.object({
  name: z.string().min(1),
  farm_name: z.string().min(1),
  phone: z.string().optional(),
  location: z.string().min(1),
  lat: z.number().optional().default(0),
  lng: z.number().optional().default(0),
  field_area_ha: z.number().positive(),
  farming_method: z.enum(["organic", "transitioning", "commercial"]),
  water_source: z.enum(["rainFed", "irrigated", "mixed"]),
  primary_crops: z.string().optional(),
});

export type CreateFarmerInput = z.infer<typeof CreateFarmerSchema>;

export const UpdateFarmerSchema = z.object({
  name: z.string().min(1).optional(),
  farm_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  field_area_ha: z.number().positive().optional(),
  farming_method: z
    .enum(["organic", "transitioning", "commercial"])
    .optional(),
  water_source: z.enum(["rainFed", "irrigated", "mixed"]).optional(),
  primary_crops: z.string().optional(),
});

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
