import { pool } from "../../db/postgres";
import { capturesService } from "../captures/captures.service";
import type { GovOverview } from "./gov.schema";

export const govService = {
  async getOverview(): Promise<GovOverview> {
    const { rows } = await pool.query<{
      total: string;
      organic: string;
      total_area: string;
      total_credits: string;
    }>(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE farming_method = 'organic') AS organic,
         COALESCE(SUM(field_area_ha), 0) AS total_area,
         COALESCE(SUM(carbon_credits), 0) AS total_credits
       FROM farmers`
    );

    const r = rows[0];
    const total = parseInt(r.total, 10);
    const organic = parseInt(r.organic, 10);

    const capturesByKind = await capturesService.getStats();
    const totalCaptures = Object.values(capturesByKind).reduce((s, n) => s + n, 0);

    return {
      totalFarmers: total,
      organicFarmers: organic,
      organicPercent: total > 0 ? Math.round((organic / total) * 100) : 0,
      totalAreaHa: parseFloat(r.total_area),
      totalCreditsIssued: parseInt(r.total_credits, 10),
      totalCaptures,
      capturesByKind,
    };
  },

  async getFarmerDetails(farmerId: string) {
    const { rows: farmers } = await pool.query(
      "SELECT * FROM farmers WHERE id = $1",
      [farmerId]
    );
    if (!farmers[0]) return null;

    const { rows: txns } = await pool.query(
      "SELECT * FROM transactions WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT 20",
      [farmerId]
    );

    const captures = await capturesService.getAll({ farmerId, limit: 100 });

    return {
      farmer: farmers[0],
      transactions: txns,
      captures,
    };
  },
};
