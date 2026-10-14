import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { portfolioSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const db = await getDb();
  let slug = base;
  for (let i = 1; i < 20; i++) {
    const rows = await db.select({ id: schema.portfolioProjects.id }).from(schema.portfolioProjects).where(eq(schema.portfolioProjects.slug, slug)).limit(1);
    if (!rows[0] || rows[0].id === exceptId) return slug;
    slug = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, portfolioSchema);

  const base = slugify(input.slug?.trim() || input.title);
  if (!base) return jsonError("Provide a title to build the URL slug from.", 422);
  const slug = await uniqueSlug(base);

  const db = await getDb();
  const [row] = await db
    .insert(schema.portfolioProjects)
    .values({
      slug,
      title: input.title,
      summary: input.summary || null,
      description: input.description || null,
      problem: input.problem || null,
      solution: input.solution || null,
      technologies: input.technologies ?? [],
      deliverables: input.deliverables || null,
      results: input.results || null,
      category: input.category || null,
      industry: input.industry || null,
      liveUrl: input.liveUrl || null,
      externalUrl: input.externalUrl || null,
      featured: input.featured ?? false,
      status: "draft",
    })
    .returning({ id: schema.portfolioProjects.id });

  await recordAudit({ adminId: admin.id, action: "portfolio.create", entity: "project", entityId: slug, ip: clientIp(req.headers) });
  return jsonOk({ id: row.id, slug });
});

export const runtime = "nodejs";
