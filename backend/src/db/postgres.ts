import { Pool } from "pg";
import { config } from "../config";
import { createLogger } from "../lib/logger";

const log = createLogger("postgres");

// Single connection pool shared across all modules.
export const pool = new Pool({
  connectionString: config.db.postgres || undefined,
  // Fallback for local dev when DATABASE_URL is not set
  host: config.db.postgres ? undefined : "localhost",
  port: config.db.postgres ? undefined : 5432,
  database: config.db.postgres ? undefined : "bioscan",
  max: 20,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  log.error("Unexpected Postgres pool error", err.message);
});

export async function connectPostgres(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    log.info("PostgreSQL connected");
    await runMigrations(client);
  } finally {
    client.release();
  }
}

// Simple inline migrations — no extra migration tool needed.
async function runMigrations(client: { query: (sql: string) => Promise<unknown> }): Promise<void> {
  log.info("Running PostgreSQL migrations…");

  await client.query(`
    CREATE TABLE IF NOT EXISTS farmers (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name            TEXT NOT NULL,
      farm_name       TEXT NOT NULL,
      phone           TEXT,
      location        TEXT NOT NULL,
      lat             DOUBLE PRECISION NOT NULL DEFAULT 0,
      lng             DOUBLE PRECISION NOT NULL DEFAULT 0,
      field_area_ha   DOUBLE PRECISION NOT NULL DEFAULT 0,
      farming_method  TEXT NOT NULL DEFAULT 'commercial',
      water_source    TEXT NOT NULL DEFAULT 'irrigated',
      primary_crops   TEXT,
      carbon_credits  INTEGER NOT NULL DEFAULT 0,
      joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      weather         JSONB NOT NULL DEFAULT '{}'
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farmer_id   UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
      amount      INTEGER NOT NULL,
      type        TEXT NOT NULL CHECK (type IN ('earned','redeemed','released')),
      description TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_farmer ON transactions(farmer_id);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS marketplace_items (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      description TEXT NOT NULL,
      credit_cost INTEGER NOT NULL,
      category    TEXT NOT NULL,
      icon_name   TEXT NOT NULL DEFAULT 'Sprout'
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL CHECK (role IN ('farmer', 'government')),
      name          TEXT NOT NULL,
      department    TEXT,
      farmer_id     UUID REFERENCES farmers(id) ON DELETE SET NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  log.info("PostgreSQL migrations complete");
}
