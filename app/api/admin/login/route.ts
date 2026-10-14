import { apiHandler, assertSameOrigin, checkRateLimit, jsonError, jsonOk, parseJson } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { attemptLogin, setSessionCookie } from "@/lib/auth";
import { clientIp, recordAudit } from "@/lib/audit";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  // Strict, identity-agnostic login throttling by IP.
  await checkRateLimit(req, "admin:login", 10, 600);
  const { email, password } = await parseJson(req, loginSchema);

  const ip = clientIp(req.headers);
  const result = await attemptLogin(email, password, {
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    await recordAudit({ action: "admin.login.failed", meta: { reason: result.reason }, ip });
    if (result.reason === "locked") {
      return jsonError(`Account temporarily locked. Try again in ${result.retryAfterMinutes} minute(s).`, 423);
    }
    return jsonError("Invalid email or password.", 401);
  }

  await setSessionCookie(result.token, result.expiresAt);
  await recordAudit({ adminId: result.admin.id, action: "admin.login", ip });
  return jsonOk({ name: result.admin.name });
});

export const runtime = "nodejs";
