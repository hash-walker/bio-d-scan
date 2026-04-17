import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../../db/postgres";
import { config } from "../../config";
import { createError } from "../../middleware/error-handler";
import type {
  LoginInput,
  RegisterFarmerInput,
  RegisterGovernmentInput,
  AuthUser,
  AuthResponse,
} from "./auth.schema";

function rowToUser(row: Record<string, unknown>): AuthUser {
  return {
    id: row.id as string,
    email: row.email as string,
    role: row.role as AuthUser["role"],
    name: row.name as string,
    department: (row.department as string) ?? null,
    farmerId: (row.farmer_id as string) ?? null,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

function signToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, role: user.role, farmerId: user.farmerId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );
}

export const authService = {
  async registerFarmer(data: RegisterFarmerInput): Promise<AuthResponse> {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [data.email]);
    if (existing.rows.length > 0) throw createError("Email already registered", 409);

    const hash = await bcrypt.hash(data.password, 10);

    // Create farmer profile first
    const farmerId = uuidv4();
    await pool.query(
      `INSERT INTO farmers (id, name, farm_name, phone, location, lat, lng,
         field_area_ha, farming_method, water_source, primary_crops, carbon_credits, weather)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        farmerId,
        data.name,
        data.farm_name,
        data.phone ?? null,
        data.location,
        data.lat ?? 0,
        data.lng ?? 0,
        data.field_area_ha,
        data.farming_method,
        data.water_source,
        data.primary_crops ?? null,
        0,
        JSON.stringify({ temp: 25, humidity: 60, condition: "Clear" }),
      ]
    );

    // Create user linked to farmer
    const { rows } = await pool.query<Record<string, unknown>>(
      `INSERT INTO users (email, password_hash, role, name, farmer_id)
       VALUES ($1,$2,'farmer',$3,$4) RETURNING *`,
      [data.email, hash, data.name, farmerId]
    );

    const user = rowToUser(rows[0]);
    return { token: signToken(user), user };
  },

  async registerGovernment(data: RegisterGovernmentInput): Promise<AuthResponse> {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [data.email]);
    if (existing.rows.length > 0) throw createError("Email already registered", 409);

    const hash = await bcrypt.hash(data.password, 10);

    const { rows } = await pool.query<Record<string, unknown>>(
      `INSERT INTO users (email, password_hash, role, name, department)
       VALUES ($1,$2,'government',$3,$4) RETURNING *`,
      [data.email, hash, data.name, data.department]
    );

    const user = rowToUser(rows[0]);
    return { token: signToken(user), user };
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const { rows } = await pool.query<Record<string, unknown>>(
      "SELECT * FROM users WHERE email = $1",
      [data.email]
    );
    if (!rows[0]) throw createError("Invalid email or password", 401);

    const valid = await bcrypt.compare(data.password, rows[0].password_hash as string);
    if (!valid) throw createError("Invalid email or password", 401);

    const user = rowToUser(rows[0]);
    return { token: signToken(user), user };
  },

  async getMe(userId: string): Promise<AuthUser> {
    const { rows } = await pool.query<Record<string, unknown>>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    if (!rows[0]) throw createError("User not found", 404);
    return rowToUser(rows[0]);
  },
};
