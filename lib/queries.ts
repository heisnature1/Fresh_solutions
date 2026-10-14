import { desc, eq, and, like, or, sql, inArray, asc, isNotNull, lte, gte } from "drizzle-orm";
import { getDb, schema } from "./db/client";

/** Public-facing read queries. Only published/approved content is exposed. */

export async function getFeaturedProjects(limit = 3) {
  const db = await getDb();
  const projects = await db
    .select()
    .from(schema.portfolioProjects)
    .where(and(eq(schema.portfolioProjects.status, "published"), eq(schema.portfolioProjects.featured, true)))
    .orderBy(desc(schema.portfolioProjects.publishedAt))
    .limit(limit);
  if (projects.length === 0) return [];
  const images = await db
    .select()
    .from(schema.projectImages)
    .where(inArray(schema.projectImages.projectId, projects.map((p) => p.id)))
    .orderBy(asc(schema.projectImages.sortOrder));
  return projects.map((p) => ({ ...p, images: images.filter((i) => i.projectId === p.id) }));
}

export async function getPublishedProjects(opts: { category?: string; industry?: string; technology?: string } = {}) {
  const db = await getDb();
  const conditions = [eq(schema.portfolioProjects.status, "published")];
  if (opts.category) conditions.push(eq(schema.portfolioProjects.category, opts.category));
  if (opts.industry) conditions.push(eq(schema.portfolioProjects.industry, opts.industry));
  const projects = await db
    .select()
    .from(schema.portfolioProjects)
    .where(and(...conditions))
    .orderBy(desc(schema.portfolioProjects.featured), desc(schema.portfolioProjects.publishedAt));
  let result = projects;
  if (opts.technology) {
    const tech = opts.technology.toLowerCase();
    result = projects.filter((p) => (p.technologies ?? []).some((t) => t.toLowerCase() === tech));
  }
  const images = result.length
    ? await db
        .select()
        .from(schema.projectImages)
        .where(inArray(schema.projectImages.projectId, result.map((p) => p.id)))
        .orderBy(asc(schema.projectImages.sortOrder))
    : [];
  return result.map((p) => ({ ...p, images: images.filter((i) => i.projectId === p.id) }));
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.portfolioProjects)
    .where(and(eq(schema.portfolioProjects.slug, slug), eq(schema.portfolioProjects.status, "published")))
    .limit(1);
  if (!rows[0]) return null;
  const images = await db
    .select()
    .from(schema.projectImages)
    .where(eq(schema.projectImages.projectId, rows[0].id))
    .orderBy(asc(schema.projectImages.sortOrder));
  return { ...rows[0], images };
}

export async function getLatestArticles(limit = 3, opts: { featuredOnly?: boolean } = {}) {
  const db = await getDb();
  const conditions = [eq(schema.articles.status, "published")];
  if (opts.featuredOnly) conditions.push(eq(schema.articles.featured, true));
  const now = new Date();
  return db
    .select()
    .from(schema.articles)
    .where(and(...conditions, isNotNull(schema.articles.publishedAt), lte(schema.articles.publishedAt, now)))
    .orderBy(desc(schema.articles.publishedAt))
    .limit(limit);
}

export async function searchArticles(opts: { q?: string; categorySlug?: string; tagSlug?: string; page?: number; perPage?: number }) {
  const db = await getDb();
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(24, opts.perPage ?? 9);
  const now = new Date();

  const conditions = [
    eq(schema.articles.status, "published"),
    isNotNull(schema.articles.publishedAt),
    lte(schema.articles.publishedAt, now),
  ];
  if (opts.q) {
    const pattern = `%${opts.q.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(like(schema.articles.title, pattern), like(schema.articles.excerpt, pattern), like(schema.articles.content, pattern))!,
    );
  }
  if (opts.categorySlug) {
    const cat = await db.select().from(schema.articleCategories).where(eq(schema.articleCategories.slug, opts.categorySlug)).limit(1);
    if (cat[0]) conditions.push(eq(schema.articles.categoryId, cat[0].id));
    else return { articles: [], total: 0, page, pages: 0 };
  }
  if (opts.tagSlug) {
    const tag = await db.select().from(schema.tags).where(eq(schema.tags.slug, opts.tagSlug)).limit(1);
    if (!tag[0]) return { articles: [], total: 0, page, pages: 0 };
    const links = await db.select().from(schema.articleTags).where(eq(schema.articleTags.tagId, tag[0].id));
    const ids = links.map((l) => l.articleId);
    if (ids.length === 0) return { articles: [], total: 0, page, pages: 0 };
    conditions.push(inArray(schema.articles.id, ids));
  }

  const base = db.select().from(schema.articles).where(and(...conditions));
  const all = await base.orderBy(desc(schema.articles.publishedAt));
  const total = all.length;
  return {
    articles: all.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    pages: Math.ceil(total / perPage),
  };
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  const now = new Date();
  const rows = await db
    .select({ article: schema.articles, category: schema.articleCategories })
    .from(schema.articles)
    .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
    .where(
      and(
        eq(schema.articles.slug, slug),
        eq(schema.articles.status, "published"),
        isNotNull(schema.articles.publishedAt),
        lte(schema.articles.publishedAt, now),
      ),
    )
    .limit(1);
  if (!rows[0]) return null;
  const tagRows = await db
    .select({ tag: schema.tags })
    .from(schema.articleTags)
    .innerJoin(schema.tags, eq(schema.articleTags.tagId, schema.tags.id))
    .where(eq(schema.articleTags.articleId, rows[0].article.id));
  return { ...rows[0].article, category: rows[0].category, tags: tagRows.map((t) => t.tag) };
}

export async function getRelatedArticles(articleId: string, categoryId: string | null, limit = 3) {
  if (!categoryId) return [];
  const db = await getDb();
  const now = new Date();
  const rows = await db
    .select()
    .from(schema.articles)
    .where(
      and(
        eq(schema.articles.status, "published"),
        eq(schema.articles.categoryId, categoryId),
        isNotNull(schema.articles.publishedAt),
        lte(schema.articles.publishedAt, now),
        sql`${schema.articles.id} != ${articleId}`,
      ),
    )
    .orderBy(desc(schema.articles.publishedAt))
    .limit(limit);
  return rows;
}

export async function getArticleCategories() {
  const db = await getDb();
  const cats = await db.select().from(schema.articleCategories).orderBy(asc(schema.articleCategories.name));
  const counts = await db
    .select({ categoryId: schema.articles.categoryId, count: sql<number>`count(*)::int` })
    .from(schema.articles)
    .where(eq(schema.articles.status, "published"))
    .groupBy(schema.articles.categoryId);
  return cats.map((c) => ({ ...c, count: counts.find((n) => n.categoryId === c.id)?.count ?? 0 }));
}

export async function getApprovedTestimonials(opts: { featuredOnly?: boolean; limit?: number } = {}) {
  const db = await getDb();
  const conditions = [eq(schema.testimonials.status, "approved")];
  if (opts.featuredOnly) conditions.push(eq(schema.testimonials.featured, true));
  return db
    .select()
    .from(schema.testimonials)
    .where(and(...conditions))
    .orderBy(desc(schema.testimonials.featured), desc(schema.testimonials.createdAt))
    .limit(opts.limit ?? 6);
}

export async function getPublishedVacancies() {
  const db = await getDb();
  return db
    .select()
    .from(schema.vacancies)
    .where(
      and(
        eq(schema.vacancies.status, "published"),
        or(
          sql`${schema.vacancies.deadline} IS NULL`,
          gte(schema.vacancies.deadline, new Date().toISOString().slice(0, 10)),
        )!,
      ),
    )
    .orderBy(desc(schema.vacancies.createdAt));
}

export async function getVacancyBySlug(slug: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.vacancies)
    .where(and(eq(schema.vacancies.slug, slug), eq(schema.vacancies.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPublicResources() {
  const db = await getDb();
  return db
    .select()
    .from(schema.resources)
    .where(and(eq(schema.resources.published, true), eq(schema.resources.isPublic, true)))
    .orderBy(desc(schema.resources.createdAt));
}
