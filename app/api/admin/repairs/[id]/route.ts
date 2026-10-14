import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { repairAdminUpdateSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, repairAdminUpdateSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.repairRequests).where(eq(schema.repairRequests.id, id)).limit(1);
  if (!existing[0]) return jsonError("Repair not found.", 404);

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.technician !== undefined) updates.technician = input.technician || null;
  if (input.diagnosis !== undefined) updates.diagnosis = input.diagnosis;
  if (input.estimatedCost !== undefined) updates.estimatedCost = input.estimatedCost === "" ? null : String(input.estimatedCost);
  if (input.estimateApproved !== undefined) updates.estimateApproved = input.estimateApproved;
  if (input.workPerformed !== undefined) updates.workPerformed = input.workPerformed;
  if (input.testingResults !== undefined) updates.testingResults = input.testingResults;
  if (input.warrantyTerms !== undefined) updates.warrantyTerms = input.warrantyTerms;

  let statusChanged = false;
  if (input.status && input.status !== existing[0].status) {
    updates.status = input.status;
    if (input.status === "completed") updates.completedAt = new Date();
    statusChanged = true;
  }

  await db.update(schema.repairRequests).set(updates).where(eq(schema.repairRequests.id, id));

  if (statusChanged) {
    await db.insert(schema.repairStatusHistory).values({
      repairId: id,
      fromStatus: existing[0].status,
      toStatus: input.status!,
      note: input.statusNote?.trim() || null,
      changedBy: admin.id,
    });
  }

  if (input.note?.trim()) {
    await db.insert(schema.repairNotes).values({
      repairId: id,
      adminId: admin.id,
      kind: input.noteKind ?? "note",
      note: input.note.trim(),
    });
  }

  await recordAudit({
    adminId: admin.id,
    action: "repair.update",
    entity: "repair",
    entityId: existing[0].reference,
    meta: { statusChanged, to: input.status, noteAdded: Boolean(input.note?.trim()) },
    ip: clientIp(req.headers),
  });

  return jsonOk();
});

export const runtime = "nodejs";
