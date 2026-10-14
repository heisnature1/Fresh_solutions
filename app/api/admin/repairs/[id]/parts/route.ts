import { and, eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { repairPartSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";

export const POST = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, repairPartSchema);

  const db = await getDb();
  const repair = await db.select({ id: schema.repairRequests.id, reference: schema.repairRequests.reference }).from(schema.repairRequests).where(eq(schema.repairRequests.id, id)).limit(1);
  if (!repair[0]) return jsonError("Repair not found.", 404);

  await db.insert(schema.repairParts).values({
    repairId: id,
    name: input.name,
    quantity: String(input.quantity),
    unitCost: input.unitCost === "" || input.unitCost === undefined ? null : String(input.unitCost),
    status: input.status ?? "needed",
  });

  await recordAudit({ adminId: admin.id, action: "repair.part.add", entity: "repair", entityId: repair[0].reference, ip: clientIp(req.headers) });
  return jsonOk();
});

export const DELETE = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const partId = new URL(req.url).searchParams.get("partId");
  if (!partId) return jsonError("Missing partId.", 400);

  const db = await getDb();
  await db.delete(schema.repairParts).where(and(eq(schema.repairParts.id, partId), eq(schema.repairParts.repairId, id)));
  await recordAudit({ adminId: admin.id, action: "repair.part.remove", entity: "repair", entityId: id, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
