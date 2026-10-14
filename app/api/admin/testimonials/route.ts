import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { testimonialAdminSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";

/** Admin-recorded testimonials (with consent record) — approved immediately. */
export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, testimonialAdminSchema);

  if (!input.consentRecorded) {
    return jsonError("Record the person's consent before saving a testimonial.", 422);
  }

  const db = await getDb();
  await db.insert(schema.testimonials).values({
    name: input.name,
    role: input.role || null,
    organisation: input.organisation || null,
    content: input.content,
    rating: input.rating === "" || input.rating === undefined ? null : input.rating,
    source: "admin",
    consentRecorded: true,
    consentNote: input.consentNote || null,
    featured: input.featured ?? false,
    status: "approved",
  });

  await recordAudit({ adminId: admin.id, action: "testimonial.create", entity: "testimonial", ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
