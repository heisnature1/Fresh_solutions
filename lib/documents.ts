import { sql } from "drizzle-orm";
import { getDb } from "./db/client";

/**
 * Shared helpers for quotation & proposal documents.
 * Document numbers are sequential per prefix+year (e.g. QT-2026-0042), which
 * is normal for internal business documents (they are never publicly exposed).
 */
export async function newDocumentNumber(prefix: "QT" | "PR"): Promise<string> {
  const db = await getDb();
  const year = new Date().getFullYear();
  const table = prefix === "QT" ? "quotations" : "proposals";
  const column = prefix === "QT" ? "quote_number" : "proposal_number";
  const rows = await db.execute<{ n: number }>(
    sql.raw(`SELECT count(*)::int AS n FROM ${table} WHERE ${column} LIKE '${prefix}-${year}-%'`),
  );
  const count = Number((rows as any).rows?.[0]?.n ?? 0);
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${prefix}-${year}-${String(count + 1 + attempt).padStart(4, "0")}`;
    const exists = await db.execute(
      sql.raw(`SELECT 1 FROM ${table} WHERE ${column} = '${candidate}' LIMIT 1`),
    );
    if (((exists as any).rows?.length ?? 0) === 0) return candidate;
  }
  // Extremely unlikely fallback: keep uniqueness with a time suffix.
  return `${prefix}-${year}-${Date.now().toString(36).toUpperCase()}`;
}

export const FINAL_DOC_STATUSES = ["accepted", "rejected", "expired", "cancelled"] as const;

export function isAutoExpired(expiryDate: string | null, status: string): boolean {
  return status === "sent" && !!expiryDate && expiryDate < new Date().toISOString().slice(0, 10);
}

/** Valid status transitions for quotations and proposals. */
export function canTransition(from: string, to: string): boolean {
  if (from === to) return true;
  if (from === "cancelled") return false;
  const allowed: Record<string, string[]> = {
    draft: ["sent", "cancelled", "draft"],
    sent: ["accepted", "rejected", "expired", "cancelled", "draft"],
    accepted: ["sent"],
    rejected: ["draft"],
    expired: ["sent", "draft"],
  };
  return (allowed[from] ?? ["draft"]).includes(to);
}
