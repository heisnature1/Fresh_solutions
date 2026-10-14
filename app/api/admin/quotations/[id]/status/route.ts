import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { canTransition } from "@/lib/documents";
import { clientIp, recordAudit } from "@/lib/audit";

const statusSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired", "cancelled"]),
});

export const POST = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const { status } = await parseJson(req, statusSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.quotations).where(eq(schema.quotations.id, id)).limit(1);
  if (!existing[0]) return jsonError("Quotation not found.", 404);
  if (!canTransition(existing[0].status, status)) {
    return jsonError(`Cannot move a quotation from "${existing[0].status}" to "${status}".`, 409);
  }

  await db
    .update(schema.quotations)
    .set({
      status,
      sentAt: status === "sent" ? new Date() : existing[0].sentAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.quotations.id, id));

  await recordAudit({
    adminId: admin.id,
    action: "quotation.status",
    entity: "quotation",
    entityId: existing[0].quoteNumber,
    meta: { from: existing[0].status, to: status },
    ip: clientIp(req.headers),
  });
  return jsonOk();
});

export const runtime = "nodejs";
