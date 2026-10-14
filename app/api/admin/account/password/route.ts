import { apiHandler, assertSameOrigin, checkRateLimit, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { passwordChangeSchema } from "@/lib/validation";
import { changePassword } from "@/lib/auth";
import { clientIp, recordAudit } from "@/lib/audit";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  await checkRateLimit(req, "admin:password", 5, 600);
  const { currentPassword, newPassword } = await parseJson(req, passwordChangeSchema);

  const result = await changePassword(admin.id, currentPassword, newPassword);
  if (!result.ok) return jsonError(result.error ?? "Password change failed.", 422);

  await recordAudit({ adminId: admin.id, action: "admin.password.change", ip: clientIp(req.headers) });
  return jsonOk({ message: "Password changed. You have been signed out — sign in again with your new password." });
});

export const runtime = "nodejs";
