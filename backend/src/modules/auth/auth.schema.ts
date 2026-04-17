import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterFarmerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  farm_name: z.string().min(2),
  phone: z.string().optional(),
  location: z.string().min(2),
  lat: z.number().optional().default(0),
  lng: z.number().optional().default(0),
  field_area_ha: z.number().positive(),
  farming_method: z.enum(["organic", "transitioning", "commercial"]),
  water_source: z.enum(["rainFed", "irrigated", "mixed"]),
  primary_crops: z.string().optional(),
});

export const RegisterGovernmentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  department: z.string().min(2),
});

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
