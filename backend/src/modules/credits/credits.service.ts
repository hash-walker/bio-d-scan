import { pool } from "../../db/postgres";
import { createError } from "../../middleware/error-handler";
import type { RedeemInput, ReleaseInput, Transaction } from "./credits.schema";

function rowToTx(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    farmerId: row.farmer_id as string,
    amount: Number(row.amount),
    type: row.type as Transaction["type"],
    description: row.description as string,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export const creditsService = {
  async getBalance(farmerId: string): Promise<number> {
    const { rows } = await pool.query<{ carbon_credits: number }>(
      "SELECT carbon_credits FROM farmers WHERE id = $1",
      [farmerId]
    );
    if (!rows[0]) throw createError("Farmer not found", 404);
    return rows[0].carbon_credits;
  },

  async getTransactions(farmerId: string): Promise<Transaction[]> {
    const { rows } = await pool.query<Record<string, unknown>>(
      "SELECT * FROM transactions WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT 50",
      [farmerId]
    );
    return rows.map(rowToTx);
  },

  async redeem(farmerId: string, input: RedeemInput): Promise<{ newBalance: number }> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Fetch item
      const { rows: items } = await client.query<{ name: string; credit_cost: number }>(
        "SELECT name, credit_cost FROM marketplace_items WHERE id = $1",
        [input.itemId]
      );
      if (!items[0]) throw createError("Marketplace item not found", 404);

      const totalCost = items[0].credit_cost * input.quantity;

      // Check balance
      const { rows: farmers } = await client.query<{ carbon_credits: number }>(
        "SELECT carbon_credits FROM farmers WHERE id = $1 FOR UPDATE",
        [farmerId]
      );
      if (!farmers[0]) throw createError("Farmer not found", 404);
      if (farmers[0].carbon_credits < totalCost)
        throw createError("Insufficient credits", 400);

      // Deduct
      const { rows: updated } = await client.query<{ carbon_credits: number }>(
        "UPDATE farmers SET carbon_credits = carbon_credits - $1 WHERE id = $2 RETURNING carbon_credits",
        [totalCost, farmerId]
      );

      await client.query(
        `INSERT INTO transactions (farmer_id, amount, type, description)
         VALUES ($1, $2, 'redeemed', $3)`,
        [farmerId, totalCost, `Redeemed: ${items[0].name} × ${input.quantity}`]
      );

      await client.query("COMMIT");
      return { newBalance: updated[0].carbon_credits };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /** Government releases credits to a farmer. */
  async release(input: ReleaseInput): Promise<{ newBalance: number }> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query<{ carbon_credits: number }>(
        "UPDATE farmers SET carbon_credits = carbon_credits + $1 WHERE id = $2 RETURNING carbon_credits",
        [input.amount, input.farmerId]
      );
      if (!rows[0]) throw createError("Farmer not found", 404);

      await client.query(
        `INSERT INTO transactions (farmer_id, amount, type, description)
         VALUES ($1, $2, 'released', $3)`,
        [
          input.farmerId,
          input.amount,
          input.description ?? "Government credit release",
        ]
      );

      await client.query("COMMIT");
      return { newBalance: rows[0].carbon_credits };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async getMarketplaceItems() {
    const { rows } = await pool.query(
      "SELECT * FROM marketplace_items ORDER BY credit_cost"
    );
    return rows;
  },
};
