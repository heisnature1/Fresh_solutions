import { apiHandler, jsonError, jsonOk } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { attemptLogin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Temporary deployment diagnostic. Remove after admin login is verified. */
const ADMIN_EMAIL = "freshlewinsky@gmail.com";
const ADMIN_NAME = "Fresh Solutions Owner";
const ADMIN_HASH =
  "scrypt:16384:8:1:Gin4Kl47aompr6skQwn+yg==:mdTYId4zvEi7fp8a9pH+iUE7ZFmxDGDmNlCzQmFLxCQl77+EPWCnJ+EU9k3ayDUakDpA05u/Avsc0BkS+uHluQ==";

export const GET = apiHandler(async () => {
  const password = process.env.ADMIN_TEST_PASSWORD;
  if (!password) return jsonError("ADMIN_TEST_PASSWORD is not configured.", 500);

  const db = await getDb();
  await db
    .insert(schema.admins)
    .values({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash: ADMIN_HASH,
      role: "owner",
    })
    .onConflictDoUpdate({
      target: schema.admins.email,
      set: {
        name: ADMIN_NAME,
        passwordHash: ADMIN_HASH,
        role: "owner",
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      },
    });

  const result = await attemptLogin(ADMIN_EMAIL, password, {});
  return jsonOk({
    adminEmail: ADMIN_EMAIL,
    loginOk: result.ok,
    reason: result.ok ? null : result.reason,
  });
});
