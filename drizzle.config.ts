import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    // drizzle-kit only needs this for `drizzle-kit push/studio`.
    // Migrations are applied by scripts/migrate.ts, which supports both
    // a managed Postgres DATABASE_URL and the embedded local PGlite engine.
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432 placeholder",
  },
});
