import { sql } from "drizzle-orm";
import { apiHandler, jsonError, jsonOk } from "@/lib/api";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Temporary deployment diagnostic. Remove after database connectivity is confirmed. */
export const GET = apiHandler(async () => {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1`);
    return jsonOk({ database: "ok" });
  } catch (error) {
    const err = error as Error & { cause?: { message?: string } };
    const detail = [err?.message, err?.cause?.message].filter(Boolean).join(" | ");
    return jsonError(detail || "Unknown database error", 500);
  }
});
