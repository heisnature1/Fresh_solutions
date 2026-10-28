/**
 * Securely provisions the initial owner/administrator account.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' ADMIN_NAME='Your Name' npm run provision:admin
 *
 * There is NO public registration route. To reset a lost password, run again
 * with --reset-password (requires shell access to the server environment).
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db/client";
import { hashPassword, passwordIssues } from "../lib/password";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Site Owner").trim();
  const reset = process.argv.includes("--reset-password");

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("✖ Set ADMIN_EMAIL to a valid email address.");
    process.exit(1);
  }
  const issues = passwordIssues(password);
  if (issues.length > 0) {
    console.error(`✖ ADMIN_PASSWORD must contain ${issues.join(", ")}.`);
    process.exit(1);
  }

  const db = await getDb();
  const existing = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
  const anyAdmin = await db.select({ id: schema.admins.id }).from(schema.admins).limit(1);

  if (existing[0]) {
    if (!reset) {
      console.error("✖ An administrator with that email already exists. Use --reset-password to set a new password.");
      process.exit(1);
    }
    await db
      .update(schema.admins)
      .set({
        passwordHash: await hashPassword(password),
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.admins.id, existing[0].id));
    await db.delete(schema.adminSessions); // revoke all sessions after a password reset
    console.log(`✔ Password reset for ${email}. All existing sessions have been revoked.`);
    process.exit(0);
  }

  if (anyAdmin[0] && !reset) {
    console.error(
      "✖ An administrator account already exists. Refusing to create another.\n" +
        "  (At MVP there is exactly one owner account. Use --reset-password with their ADMIN_EMAIL to recover.)",
    );
    process.exit(1);
  }

  await db.insert(schema.admins).values({
    email,
    name: name || "Site Owner",
    passwordHash: await hashPassword(password),
    role: "owner",
  });
  console.log(`✔ Administrator provisioned: ${email}`);
  console.log("  Sign in at /admin — keep these credentials private and do not store them in Git.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
