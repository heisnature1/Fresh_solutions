import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { testimonialModerationSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, testimonialModerationSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id)).limit(1);
  if (!existing[0]) return jsonError("Testimonial not found.", 404);

  // Customer-submitted reviews need a consent record before approval. When the
  // reviewer gave consent directly (e.g. email), the admin records it here.
  if (input.status === "approved" && existing[0].source === "customer" && !existing[0].consentRecorded) {
    const consent = new URL(req.url).searchParams.get("consent");
    if (consent !== "1") {
      return jsonError("Record consent before approving a customer-submitted review (resend with consent confirmation).", 422);
    }
    await db
      .update(schema.testimonials)
      .set({ consentRecorded: true, consentNote: "Consent confirmed and recorded by administrator.", updatedAt: new Date() })
      .where(eq(schema.testimonials.id, id));
  }

  await db
    .update(schema.testimonials)
    .set({ status: input.status, featured: input.featured ?? existing[0].featured, updatedAt: new Date() })
    .where(eq(schema.testimonials.id, id));

  await recordAudit({
    adminId: admin.id,
    action: "testimonial.moderate",
    entity: "testimonial",
    entityId: existing[0].id,
    meta: { status: input.status },
    ip: clientIp(req.headers),
  });
  return jsonOk();
});

export const DELETE = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  await recordAudit({ adminId: admin.id, action: "testimonial.delete", entity: "testimonial", entityId: id, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
