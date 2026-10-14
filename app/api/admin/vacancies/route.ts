import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { vacancySchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, vacancySchema);

  const base = slugify(input.slug?.trim() || input.title);
  if (!base) return jsonError("Provide a job title to build the URL slug from.", 422);
  const db = await getDb();
  let slug = base;
  for (let i = 1; i < 20; i++) {
    const taken = await db.select({ id: schema.vacancies.id }).from(schema.vacancies).where(eq(schema.vacancies.slug, slug)).limit(1);
    if (!taken[0]) break;
    slug = `${base}-${i + 1}`;
  }

  const [row] = await db
    .insert(schema.vacancies)
    .values({
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
      status: "draft",
    })
    .returning({ id: schema.vacancies.id });

  await recordAudit({ adminId: admin.id, action: "vacancy.create", entity: "vacancy", entityId: slug, ip: clientIp(req.headers) });
  return jsonOk({ id: row.id, slug });
});

export const runtime = "nodejs";
