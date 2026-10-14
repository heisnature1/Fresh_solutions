/**
 * Applies SQL migrations from db/migrations to the configured database.
 * Usage: npm run db:migrate
 */
import { getDb } from "../lib/db/client";

async function main() {
  await getDb();
  console.log("✔ Migrations applied (", process.env.DATABASE_URL ? "external PostgreSQL" : "embedded local Postgres", ")");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
