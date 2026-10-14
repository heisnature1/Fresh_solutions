import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { applicationUpdateSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, applicationUpdateSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.applications).where(eq(schema.applications.id, id)).limit(1);
  if (!existing[0]) return jsonError("Application not found.", 404);

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.status) updates.status = input.status;
  if (input.interviewNotes !== undefined) updates.interviewNotes = input.interviewNotes;
  if (input.interviewAt) {
    const parsed = new Date(input.interviewAt);
    if (!Number.isNaN(parsed.getTime())) updates.interviewAt = parsed;
  }

  await db.update(schema.applications).set(updates).where(eq(schema.applications.id, id));

  if (input.note?.trim()) {
    await db.insert(schema.applicationNotes).values({ applicationId: id, adminId: admin.id, note: input.note.trim() });
  }

  await recordAudit({
    adminId: admin.id,
    action: "application.update",
    entity: "application",
    entityId: existing[0].reference,
    meta: { status: input.status, noteAdded: Boolean(input.note?.trim()) },
    ip: clientIp(req.headers),
  });
  return jsonOk();
});

export const runtime = "nodejs";
