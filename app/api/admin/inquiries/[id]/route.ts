import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { inquiryUpdateSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, inquiryUpdateSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.inquiries).where(eq(schema.inquiries.id, id)).limit(1);
  if (!existing[0]) return jsonError("Inquiry not found.", 404);

  await db
    .update(schema.inquiries)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(schema.inquiries.id, id));

  if (input.note?.trim()) {
    await db.insert(schema.inquiryNotes).values({ inquiryId: id, adminId: admin.id, note: input.note.trim() });
  }

  await recordAudit({
    adminId: admin.id,
    action: "inquiry.update",
    entity: "inquiry",
    entityId: existing[0].reference,
    meta: { status: input.status, noteAdded: Boolean(input.note?.trim()) },
    ip: clientIp(req.headers),
  });

  return jsonOk();
});

export const runtime = "nodejs";
