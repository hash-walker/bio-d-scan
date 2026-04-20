"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farmerService = void 0;
const uuid_1 = require("uuid");
const postgres_1 = require("../../db/postgres");
const error_handler_1 = require("../../middleware/error-handler");
function rowToFarmer(row) {
    return {
        id: row.id,
        name: row.name,
        farm_name: row.farm_name,
        phone: row.phone ?? null,
        location: row.location,
        lat: Number(row.lat),
        lng: Number(row.lng),
        field_area_ha: Number(row.field_area_ha),
        farming_method: row.farming_method,
        water_source: row.water_source,
        primary_crops: row.primary_crops ?? null,
        carbon_credits: Number(row.carbon_credits),
        joined_at: row.joined_at.toISOString(),
        weather: row.weather,
    };
}
exports.farmerService = {
    async create(data) {
        const id = (0, uuid_1.v4)();
        const { rows } = await postgres_1.pool.query(`INSERT INTO farmers
         (id, name, farm_name, phone, location, lat, lng,
          field_area_ha, farming_method, water_source, primary_crops,
          carbon_credits, weather)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`, [
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
        ]);
        return rowToFarmer(rows[0]);
    },
    async getAll() {
        const { rows } = await postgres_1.pool.query("SELECT * FROM farmers ORDER BY name");
        return rows.map(rowToFarmer);
    },
    async getById(id) {
        const { rows } = await postgres_1.pool.query("SELECT * FROM farmers WHERE id = $1", [id]);
        if (!rows[0])
            throw (0, error_handler_1.createError)("Farmer not found", 404);
        return rowToFarmer(rows[0]);
    },
    async update(id, data) {
        const sets = [];
        const values = [];
        let idx = 1;
        for (const [key, val] of Object.entries(data)) {
            if (val !== undefined) {
                sets.push(`${key} = $${idx++}`);
                values.push(val);
            }
        }
        if (sets.length === 0)
            throw (0, error_handler_1.createError)("No fields to update", 400);
        values.push(id);
        const { rows } = await postgres_1.pool.query(`UPDATE farmers SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`, values);
        if (!rows[0])
            throw (0, error_handler_1.createError)("Farmer not found", 404);
        return rowToFarmer(rows[0]);
    },
};
//# sourceMappingURL=farmer.service.js.map