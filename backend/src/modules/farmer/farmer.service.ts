import { v4 as uuidv4 } from "uuid";
import { pool } from "../../db/postgres";
import { createError } from "../../middleware/error-handler";
import type { Farmer, CreateFarmerInput, UpdateFarmerInput } from "./farmer.schema";

function rowToFarmer(row: Record<string, unknown>): Farmer {
  return {
    id: row.id as string,
    name: row.name as string,
    farm_name: row.farm_name as string,
    phone: (row.phone as string) ?? null,
    location: row.location as string,
    lat: Number(row.lat),
    lng: Number(row.lng),
    field_area_ha: Number(row.field_area_ha),
    farming_method: row.farming_method as Farmer["farming_method"],
    water_source: row.water_source as Farmer["water_source"],
    primary_crops: (row.primary_crops as string) ?? null,
    carbon_credits: Number(row.carbon_credits),
    joined_at: (row.joined_at as Date).toISOString(),
    weather: row.weather as Farmer["weather"],
  };
}

export const farmerService = {
  async create(data: CreateFarmerInput): Promise<Farmer> {
    const id = uuidv4();
    const { rows } = await pool.query<Record<string, unknown>>(
      `INSERT INTO farmers
         (id, name, farm_name, phone, location, lat, lng,
          field_area_ha, farming_method, water_source, primary_crops,
          carbon_credits, weather)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        id,
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
    return rowToFarmer(rows[0]);
  },

  async getAll(): Promise<Farmer[]> {
    const { rows } = await pool.query<Record<string, unknown>>(
      "SELECT * FROM farmers ORDER BY name"
    );
    return rows.map(rowToFarmer);
  },

  async getById(id: string): Promise<Farmer> {
    const { rows } = await pool.query<Record<string, unknown>>(
      "SELECT * FROM farmers WHERE id = $1",
      [id]
    );
    if (!rows[0]) throw createError("Farmer not found", 404);
    return rowToFarmer(rows[0]);
  },

  async update(id: string, data: UpdateFarmerInput): Promise<Farmer> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        sets.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }

    if (sets.length === 0) throw createError("No fields to update", 400);

    values.push(id);
    const { rows } = await pool.query<Record<string, unknown>>(
      `UPDATE farmers SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows[0]) throw createError("Farmer not found", 404);
    return rowToFarmer(rows[0]);
  },
};
