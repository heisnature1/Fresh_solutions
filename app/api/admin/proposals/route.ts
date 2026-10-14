import { apiHandler, assertSameOrigin, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { proposalSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { newDocumentNumber } from "@/lib/documents";
import { clientIp, recordAudit } from "@/lib/audit";

const OPTIONAL = [
  "executiveSummary", "requirements", "solution", "scopeOfWork", "deliverables",
  "milestones", "timeline", "pricing", "assumptions", "exclusions", "terms",
] as const;

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, proposalSchema);

  const db = await getDb();
  const proposalNumber = await newDocumentNumber("PR");
  const values: Record<string, unknown> = {
    proposalNumber,
    inquiryId: input.inquiryId || null,
    clientName: input.clientName,
    clientOrganisation: input.clientOrganisation || null,
    clientEmail: input.clientEmail || null,
    title: input.title,
    validityDays: input.validityDays ?? 30,
    currency: input.currency ?? "GHS",
    status: "draft",
    createdBy: admin.id,
  };
  for (const k of OPTIONAL) values[k] = input[k] || null;

  const [row] = await db.insert(schema.proposals).values(values as never).returning({ id: schema.proposals.id });
  await recordAudit({ adminId: admin.id, action: "proposal.create", entity: "proposal", entityId: proposalNumber, ip: clientIp(req.headers) });
  return jsonOk({ id: row.id, proposalNumber });
});

export const runtime = "nodejs";
