import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { articleSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

const actionSchema = z.object({
  action: z.enum(["publish", "unpublish", "archive"]),
});

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;

  const db = await getDb();
  const existing = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1);
  if (!existing[0]) return jsonError("Article not found.", 404);

  const body = await req.json().catch(() => ({}));

  // Action-style update: publish / unpublish / archive
  const action = actionSchema.safeParse(body);
  if (action.success) {
    const a = action.data.action;
    if (a === "publish") {
      if (!existing[0].content.trim()) return jsonError("Write the article content before publishing.", 422);
      const scheduled = existing[0].scheduledAt;
      const publishAt = scheduled && scheduled > new Date() ? scheduled : new Date();
      await db
        .update(schema.articles)
        .set({ status: "published", publishedAt: publishAt, updatedAt: new Date() })
        .where(eq(schema.articles.id, id));
    } else {
      await db
        .update(schema.articles)
        .set({
          status: a === "archive" ? "archived" : "draft",
          publishedAt: a === "unpublish" ? null : existing[0].publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.articles.id, id));
    }
    await recordAudit({ adminId: admin.id, action: `article.${action.data.action}`, entity: "article", entityId: existing[0].slug, ip: clientIp(req.headers) });
    return jsonOk();
  }

  // Full edit
  const input = articleSchema.parse(body);
  const slugBase = slugify(input.slug?.trim() || input.title);
  let slug = existing[0].slug;
  if (slugBase && slugBase !== existing[0].slug) {
    const taken = await db.select({ id: schema.articles.id }).from(schema.articles).where(eq(schema.articles.slug, slugBase)).limit(1);
    if (!taken[0]) slug = slugBase;
  }

  await db
    .update(schema.articles)
    .set({
      slug,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content,
      categoryId: input.categoryId || null,
      authorName: input.authorName || null,
      featured: input.featured ?? false,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      scheduledAt: input.scheduledAt ? new Date(`${input.scheduledAt}T09:00:00`) : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.articles.id, id));

  const { upsertTags } = await import("@/lib/articles");
  await upsertTags(db, input.tagsCsv, id);
  await recordAudit({ adminId: admin.id, action: "article.update", entity: "article", entityId: slug, ip: clientIp(req.headers) });
  return jsonOk();
});

export const DELETE = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  await db.delete(schema.articles).where(eq(schema.articles.id, id));
  await recordAudit({ adminId: admin.id, action: "article.delete", entity: "article", entityId: id, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
