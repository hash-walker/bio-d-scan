"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const postgres_1 = require("../../db/postgres");
const config_1 = require("../../config");
const error_handler_1 = require("../../middleware/error-handler");
function rowToUser(row) {
    return {
        id: row.id,
        email: row.email,
        role: row.role,
        name: row.name,
        department: row.department ?? null,
        farmerId: row.farmer_id ?? null,
        createdAt: row.created_at.toISOString(),
    };
}
function signToken(user) {
    return jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, farmerId: user.farmerId }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
}
exports.authService = {
    async registerFarmer(data) {
        const existing = await postgres_1.pool.query("SELECT id FROM users WHERE email = $1", [data.email]);
        if (existing.rows.length > 0)
            throw (0, error_handler_1.createError)("Email already registered", 409);
        const hash = await bcryptjs_1.default.hash(data.password, 10);
        // Create farmer profile first
        const farmerId = (0, uuid_1.v4)();
        await postgres_1.pool.query(`INSERT INTO farmers (id, name, farm_name, phone, location, lat, lng,
         field_area_ha, farming_method, water_source, primary_crops, carbon_credits, weather)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
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
        ]);
        // Create user linked to farmer
        const { rows } = await postgres_1.pool.query(`INSERT INTO users (email, password_hash, role, name, farmer_id)
       VALUES ($1,$2,'farmer',$3,$4) RETURNING *`, [data.email, hash, data.name, farmerId]);
        const user = rowToUser(rows[0]);
        return { token: signToken(user), user };
    },
    async registerGovernment(data) {
        const existing = await postgres_1.pool.query("SELECT id FROM users WHERE email = $1", [data.email]);
        if (existing.rows.length > 0)
            throw (0, error_handler_1.createError)("Email already registered", 409);
        const hash = await bcryptjs_1.default.hash(data.password, 10);
        const { rows } = await postgres_1.pool.query(`INSERT INTO users (email, password_hash, role, name, department)
       VALUES ($1,$2,'government',$3,$4) RETURNING *`, [data.email, hash, data.name, data.department]);
        const user = rowToUser(rows[0]);
        return { token: signToken(user), user };
    },
    async login(data) {
        const { rows } = await postgres_1.pool.query("SELECT * FROM users WHERE email = $1", [data.email]);
        if (!rows[0])
            throw (0, error_handler_1.createError)("Invalid email or password", 401);
        const valid = await bcryptjs_1.default.compare(data.password, rows[0].password_hash);
        if (!valid)
            throw (0, error_handler_1.createError)("Invalid email or password", 401);
        const user = rowToUser(rows[0]);
        return { token: signToken(user), user };
    },
    async getMe(userId) {
        const { rows } = await postgres_1.pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        if (!rows[0])
            throw (0, error_handler_1.createError)("User not found", 404);
        return rowToUser(rows[0]);
    },
};
//# sourceMappingURL=auth.service.js.map