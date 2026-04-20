"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditsService = void 0;
const postgres_1 = require("../../db/postgres");
const error_handler_1 = require("../../middleware/error-handler");
function rowToTx(row) {
    return {
        id: row.id,
        farmerId: row.farmer_id,
        amount: Number(row.amount),
        type: row.type,
        description: row.description,
        createdAt: row.created_at.toISOString(),
    };
}
exports.creditsService = {
    async getBalance(farmerId) {
        const { rows } = await postgres_1.pool.query("SELECT carbon_credits FROM farmers WHERE id = $1", [farmerId]);
        if (!rows[0])
            throw (0, error_handler_1.createError)("Farmer not found", 404);
        return rows[0].carbon_credits;
    },
    async getTransactions(farmerId) {
        const { rows } = await postgres_1.pool.query("SELECT * FROM transactions WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT 50", [farmerId]);
        return rows.map(rowToTx);
    },
    async redeem(farmerId, input) {
        const client = await postgres_1.pool.connect();
        try {
            await client.query("BEGIN");
            // Fetch item
            const { rows: items } = await client.query("SELECT name, credit_cost FROM marketplace_items WHERE id = $1", [input.itemId]);
            if (!items[0])
                throw (0, error_handler_1.createError)("Marketplace item not found", 404);
            const totalCost = items[0].credit_cost * input.quantity;
            // Check balance
            const { rows: farmers } = await client.query("SELECT carbon_credits FROM farmers WHERE id = $1 FOR UPDATE", [farmerId]);
            if (!farmers[0])
                throw (0, error_handler_1.createError)("Farmer not found", 404);
            if (farmers[0].carbon_credits < totalCost)
                throw (0, error_handler_1.createError)("Insufficient credits", 400);
            // Deduct
            const { rows: updated } = await client.query("UPDATE farmers SET carbon_credits = carbon_credits - $1 WHERE id = $2 RETURNING carbon_credits", [totalCost, farmerId]);
            await client.query(`INSERT INTO transactions (farmer_id, amount, type, description)
         VALUES ($1, $2, 'redeemed', $3)`, [farmerId, totalCost, `Redeemed: ${items[0].name} × ${input.quantity}`]);
            await client.query("COMMIT");
            return { newBalance: updated[0].carbon_credits };
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    },
    /** Government releases credits to a farmer. */
    async release(input) {
        const client = await postgres_1.pool.connect();
        try {
            await client.query("BEGIN");
            const { rows } = await client.query("UPDATE farmers SET carbon_credits = carbon_credits + $1 WHERE id = $2 RETURNING carbon_credits", [input.amount, input.farmerId]);
            if (!rows[0])
                throw (0, error_handler_1.createError)("Farmer not found", 404);
            await client.query(`INSERT INTO transactions (farmer_id, amount, type, description)
         VALUES ($1, $2, 'released', $3)`, [
                input.farmerId,
                input.amount,
                input.description ?? "Government credit release",
            ]);
            await client.query("COMMIT");
            return { newBalance: rows[0].carbon_credits };
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    },
    async getMarketplaceItems() {
        const { rows } = await postgres_1.pool.query("SELECT * FROM marketplace_items ORDER BY credit_cost");
        return rows;
    },
};
//# sourceMappingURL=credits.service.js.map