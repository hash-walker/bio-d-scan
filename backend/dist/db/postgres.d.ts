import { Pool } from "pg";
export declare const pool: Pool;
export declare function connectPostgres(): Promise<void>;
