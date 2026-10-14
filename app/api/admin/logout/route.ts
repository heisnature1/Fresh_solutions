import { apiHandler, assertSameOrigin, jsonOk } from "@/lib/api";
import { clearSessionCookie, destroySession, getSessionToken, getCurrentAdmin } from "@/lib/auth";
import { clientIp, recordAudit } from "@/lib/audit";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const session = await getCurrentAdmin();
  const token = await getSessionToken();
  if (token) await destroySession(token);
  await clearSessionCookie();
  if (session) {
    await recordAudit({ adminId: session.admin.id, action: "admin.logout", ip: clientIp(req.headers) });
  }
  return jsonOk();
});

export const runtime = "nodejs";
