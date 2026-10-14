import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { proposalSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";

const OPTIONAL = [
  "executiveSummary", "requirements", "solution", "scopeOfWork", "deliverables",
  "milestones", "timeline", "pricing", "assumptions", "exclusions", "terms",
] as const;

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, proposalSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.proposals).where(eq(schema.proposals.id, id)).limit(1);
  if (!existing[0]) return jsonError("Proposal not found.", 404);
  if (existing[0].status !== "draft") return jsonError("Only draft proposals can be edited. Revert to draft first.", 409);

  const values: Record<string, unknown> = {
    inquiryId: input.inquiryId || null,
    clientName: input.clientName,
    clientOrganisation: input.clientOrganisation || null,
    clientEmail: input.clientEmail || null,
    title: input.title,
    validityDays: input.validityDays ?? 30,
    currency: input.currency ?? "GHS",
    updatedAt: new Date(),
  };
  for (const k of OPTIONAL) values[k] = input[k] || null;

  await db.update(schema.proposals).set(values as never).where(eq(schema.proposals.id, id));
  await recordAudit({ adminId: admin.id, action: "proposal.update", entity: "proposal", entityId: existing[0].proposalNumber, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
