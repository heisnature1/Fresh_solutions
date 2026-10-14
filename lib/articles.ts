import { eq } from "drizzle-orm";
import { getDb, schema } from "./db/client";
import { slugify } from "./utils";

/** Replace an article's tag links from a comma-separated list (upserting tags). */
export async function upsertTags(
  db: Awaited<ReturnType<typeof getDb>>,
  csv: string | undefined,
  articleId: string,
) {
  await db.delete(schema.articleTags).where(eq(schema.articleTags.articleId, articleId));
  const names = (csv ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    await db.insert(schema.tags).values({ name, slug }).onConflictDoNothing({ target: schema.tags.slug });
    const tag = await db.select().from(schema.tags).where(eq(schema.tags.slug, slug)).limit(1);
    if (tag[0]) {
      await db.insert(schema.articleTags).values({ articleId, tagId: tag[0].id }).onConflictDoNothing();
    }
  }
}

export async function uniqueArticleSlug(base: string, exceptId?: string): Promise<string> {
  const db = await getDb();
  let slug = base;
  for (let i = 1; i < 20; i++) {
    const rows = await db.select({ id: schema.articles.id }).from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
    if (!rows[0] || rows[0].id === exceptId) return slug;
    slug = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
