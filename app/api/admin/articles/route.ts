import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { articleSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { uniqueArticleSlug, upsertTags } from "@/lib/articles";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, articleSchema);

  const base = slugify(input.slug?.trim() || input.title);
  if (!base) return jsonError("Provide a title to build the URL slug from.", 422);
  const db = await getDb();
  const slug = await uniqueArticleSlug(base);

  const [row] = await db
    .insert(schema.articles)
    .values({
      slug,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content,
      categoryId: input.categoryId || null,
      authorName: input.authorName || admin.name,
      featured: input.featured ?? false,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      scheduledAt: input.scheduledAt ? new Date(`${input.scheduledAt}T09:00:00`) : null,
      status: "draft",
    })
    .returning({ id: schema.articles.id });

  await upsertTags(db, input.tagsCsv, row.id);
  await recordAudit({ adminId: admin.id, action: "article.create", entity: "article", entityId: slug, ip: clientIp(req.headers) });
  return jsonOk({ id: row.id, slug });
});

export const runtime = "nodejs";
