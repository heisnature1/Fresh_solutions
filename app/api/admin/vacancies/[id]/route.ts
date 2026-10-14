import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { vacancySchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

const statusSchema = z.object({ status: z.enum(["draft", "published", "closed"]) });

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  const existing = await db.select().from(schema.vacancies).where(eq(schema.vacancies.id, id)).limit(1);
  if (!existing[0]) return jsonError("Vacancy not found.", 404);

  const body = await req.json().catch(() => ({}));
  const statusOnly = statusSchema.safeParse(body);
  if (statusOnly.success) {
    const next = statusOnly.data.status;
    if (next === "published" && !(existing[0].responsibilities?.trim() || existing[0].summary?.trim())) {
      return jsonError("Add at least a summary or responsibilities before publishing.", 422);
    }
    await db.update(schema.vacancies).set({ status: next, updatedAt: new Date() }).where(eq(schema.vacancies.id, id));
    await recordAudit({ adminId: admin.id, action: "vacancy.status", entity: "vacancy", entityId: existing[0].slug, meta: { status: next }, ip: clientIp(req.headers) });
    return jsonOk();
  }

  const input = vacancySchema.parse(body);
  const slugBase = slugify(input.slug?.trim() || input.title);
  let slug = existing[0].slug;
  if (slugBase && slugBase !== existing[0].slug) {
    const taken = await db.select({ id: schema.vacancies.id }).from(schema.vacancies).where(eq(schema.vacancies.slug, slugBase)).limit(1);
    if (!taken[0]) slug = slugBase;
  }

  await db
    .update(schema.vacancies)
    .set({
      slug,
      title: input.title,
      department: input.department || null,
      employmentType: input.employmentType,
      location: input.location || null,
      remote: input.remote ?? false,
      summary: input.summary || null,
      responsibilities: input.responsibilities || null,
      skills: input.skills || null,
      qualifications: input.qualifications || null,
      deadline: input.deadline || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.vacancies.id, id));

  await recordAudit({ adminId: admin.id, action: "vacancy.update", entity: "vacancy", entityId: slug, ip: clientIp(req.headers) });
  return jsonOk();
});

export const DELETE = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  // Applications cascade-delete with the vacancy (documented retention behaviour).
  await db.delete(schema.vacancies).where(eq(schema.vacancies.id, id));
  await recordAudit({ adminId: admin.id, action: "vacancy.delete", entity: "vacancy", entityId: id, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
