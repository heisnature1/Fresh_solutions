import { cookies } from "next/headers";
import { cache } from "react";
import { eq, gt, and } from "drizzle-orm";
import { getDb, schema } from "./db/client";
import { randomToken, sha256 } from "./crypto";
import { hashPassword, verifyPassword, passwordIssues } from "./password";

export { hashPassword, verifyPassword, passwordIssues } from "./password";

const SESSION_COOKIE = "fs_session";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// ---------------------------------------------------------------------------
// Sessions (opaque random tokens; DB stores only the SHA-256 hash)
// ---------------------------------------------------------------------------

function sessionTtlMs(): number {
  const hours = Number(process.env.SESSION_TTL_HOURS ?? 12);
  return (Number.isFinite(hours) && hours > 0 ? hours : 12) * 60 * 60 * 1000;
}

export async function createSession(
  adminId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<{ token: string; expiresAt: Date }> {
  const db = await getDb();
  const token = randomToken(48);
  const expiresAt = new Date(Date.now() + sessionTtlMs());
  await db.insert(schema.adminSessions).values({
    tokenHash: sha256(token),
    adminId,
    expiresAt,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent?.slice(0, 400) ?? null,
  });
  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, sha256(token)));
}

export interface SessionInfo {
  admin: typeof schema.admins.$inferSelect;
  expiresAt: Date;
}

export async function resolveSession(token: string | undefined): Promise<SessionInfo | null> {
  if (!token) return null;
  const db = await getDb();
  const rows = await db
    .select({ session: schema.adminSessions, admin: schema.admins })
    .from(schema.adminSessions)
    .innerJoin(schema.admins, eq(schema.adminSessions.adminId, schema.admins.id))
    .where(and(eq(schema.adminSessions.tokenHash, sha256(token)), gt(schema.adminSessions.expiresAt, new Date())))
    .limit(1);
  if (rows.length === 0) return null;
  return { admin: rows[0].admin, expiresAt: rows[0].session.expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

/** Cached per-request resolution of the current admin, or null. */
export const getCurrentAdmin = cache(async () => {
  const token = await getSessionToken();
  return resolveSession(token);
});

// ---------------------------------------------------------------------------
// Login with lockout
// ---------------------------------------------------------------------------

export type LoginResult =
  | { ok: true; token: string; expiresAt: Date; admin: typeof schema.admins.$inferSelect }
  | { ok: false; reason: "invalid" | "locked"; retryAfterMinutes?: number };

export async function attemptLogin(
  email: string,
  password: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<LoginResult> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.admins)
    .where(eq(schema.admins.email, email.toLowerCase().trim()))
    .limit(1);
  const admin = rows[0];

  // Uniform failure path (no account enumeration via timing/message).
  if (!admin) {
    await verifyPassword(password, await hashPassword("dummy-password-for-timing"));
    return { ok: false, reason: "invalid" };
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const retryAfterMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
    return { ok: false, reason: "locked", retryAfterMinutes };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    const attempts = admin.failedAttempts + 1;
    const lock =
      attempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60000)
        : null;
    await db
      .update(schema.admins)
      .set({ failedAttempts: lock ? 0 : attempts, lockedUntil: lock })
      .where(eq(schema.admins.id, admin.id));
    if (lock) return { ok: false, reason: "locked", retryAfterMinutes: LOCK_MINUTES };
    return { ok: false, reason: "invalid" };
  }

  await db
    .update(schema.admins)
    .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(schema.admins.id, admin.id));

  const { token, expiresAt } = await createSession(admin.id, meta);
  return { ok: true, token, expiresAt, admin };
}

/** Password change with verification of the current password. */
export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const issues = passwordIssues(newPassword);
  if (issues.length > 0) return { ok: false, error: `Password must contain ${issues.join(", ")}.` };
  const db = await getDb();
  const rows = await db.select().from(schema.admins).where(eq(schema.admins.id, adminId)).limit(1);
  const admin = rows[0];
  if (!admin) return { ok: false, error: "Account not found." };
  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    return { ok: false, error: "Current password is incorrect." };
  }
  await db
    .update(schema.admins)
    .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(schema.admins.id, adminId));
  // Sign out the current session after the password change.
  const token = await getSessionToken();
  if (token) await destroySession(token);
  return { ok: true };
}
