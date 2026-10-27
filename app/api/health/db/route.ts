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
    console.error("[health/db] database check failed:", error);
    const err = error as Error & {
      cause?: Error & { code?: string; detail?: string; hint?: string };
    };
    const cause = err?.cause;
    const detail = [
      err?.name,
      err?.message,
      cause?.name && `cause: ${cause.name}`,
      cause?.message,
      cause?.code && `code: ${cause.code}`,
      cause?.detail,
      cause?.hint,
      err?.stack?.split("\n").slice(0, 4).join(" | "),
    ]
      .filter(Boolean)
      .join(" | ");
    return jsonError(detail || "Unknown database error", 500);
  }
});
