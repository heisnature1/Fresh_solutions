import { sql } from "drizzle-orm";
import { getDb, schema } from "./db/client";

/**
 * DB-backed fixed-window rate limiting. Survives restarts and is shared when
 * the same database backs multiple instances. For high-traffic multi-region
 * deployments this can later be swapped for a dedicated store (e.g. Redis).
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const db = await getDb();
  const windowMs = opts.windowSeconds * 1000;
  const now = new Date();
  const resetBefore = new Date(now.getTime() - windowMs);

  // Atomically upsert + count within the window.
  const rows = await db.execute<{ count: number; window_start: Date }>(sql`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${opts.key}, 1, ${now})
    ON CONFLICT (key) DO UPDATE
      SET count = CASE
            WHEN rate_limits.window_start < ${resetBefore} THEN 1
            ELSE rate_limits.count + 1
          END,
          window_start = CASE
            WHEN rate_limits.window_start < ${resetBefore} THEN ${now}
            ELSE rate_limits.window_start
          END
    RETURNING count, window_start
  `);

  const row = (rows as { rows?: Array<{ count: number; window_start: Date }> }).rows?.[0] ?? (rows as unknown as Array<{ count: number; window_start: Date }>)[0];
  const count = Number(row?.count ?? 1);
  const windowStart = row?.window_start ? new Date(row.window_start) : now;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 1000));

  return {
    allowed: count <= opts.limit,
    remaining: Math.max(0, opts.limit - count),
    retryAfterSeconds,
  };
}

/** Expire stale windows opportunistically (called occasionally, non-critical). */
export async function pruneRateLimits(olderThanHours = 24): Promise<void> {
  try {
    const db = await getDb();
    const cutoff = new Date(Date.now() - olderThanHours * 3600_000);
    await db.execute(sql`DELETE FROM rate_limits WHERE window_start < ${cutoff}`);
  } catch {
    /* non-critical */
  }
}
