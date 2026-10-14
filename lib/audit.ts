import { getDb, schema } from "./db/client";

/**
 * Administrative audit trail. Never log secrets, passwords, or tokens here —
 * only the action, the entity touched, and small non-sensitive metadata.
 */
export async function recordAudit(opts: {
  adminId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  ip?: string | null;
}): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(schema.auditLog).values({
      adminId: opts.adminId ?? null,
      action: opts.action.slice(0, 110),
      entity: opts.entity?.slice(0, 70) ?? null,
      entityId: opts.entityId?.slice(0, 70) ?? null,
      meta: opts.meta ?? null,
      ip: opts.ip ?? null,
    });
  } catch {
    /* audit logging must not break the main operation */
  }
}

export function clientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 60);
  return null;
}
