import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";
import type { PgliteDatabase } from "drizzle-orm/pglite";

/**
 * Dual-driver database access:
 *
 * - DATABASE_URL set   -> managed PostgreSQL via node-postgres (production).
 * - DATABASE_URL empty -> embedded PostgreSQL (PGlite, WASM) persisted under
 *   LOCAL_DATA_DIR (default ./.data/pg). This is a real Postgres engine, so
 *   the same SQL/migrations run in both environments.
 *
 * Migrations from ./db/migrations are applied automatically once per process
 * (idempotent) before the first query.
 */

export type Database = PgliteDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __fsDb?: Database;
  __fsDbReady?: Promise<Database>;
};

export function dataDir(): string {
  const dir = process.env.LOCAL_DATA_DIR || path.join(process.cwd(), ".data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function createDb(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  let db: Database;

  if (url) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pg = await import("pg");
    const pool = new pg.default.Pool({
      connectionString: url,
      ssl: url.includes("localhost") || url.includes("127.0.0.1")
        ? undefined
        : { rejectUnauthorized: true },
      max: 5,
    });
    db = drizzle(pool, { schema }) as unknown as Database;
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "db/migrations") });
  } else {
    if (process.env.VERCEL) {
      // Vercel serverless filesystem is ephemeral — fail loudly instead of
      // silently losing data on every deploy.
      throw new Error(
        "DATABASE_URL is not configured. Embedded local Postgres is only for " +
          "local development; configure a managed PostgreSQL DATABASE_URL for deployment.",
      );
    }
    const { PGlite } = await import("@electric-sql/pglite");
    const client = new PGlite(path.join(dataDir(), "pg"));
    const { drizzle } = await import("drizzle-orm/pglite");
    db = drizzle(client, { schema });
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "db/migrations") });
  }

  globalForDb.__fsDb = db;
  return db;
}

/** Primary accessor. Applies pending migrations on first call. */
export async function getDb(): Promise<Database> {
  if (globalForDb.__fsDb) return globalForDb.__fsDb;
  if (!globalForDb.__fsDbReady) {
    globalForDb.__fsDbReady = createDb().catch((err) => {
      globalForDb.__fsDbReady = undefined;
      throw err;
    });
  }
  return globalForDb.__fsDbReady;
}

export { schema };
