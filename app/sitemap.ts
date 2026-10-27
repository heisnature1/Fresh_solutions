import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/constants";
import { siteUrl } from "@/lib/settings";
import { getDb, schema } from "@/lib/db/client";
import { and, eq, isNotNull, lte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/solutions`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pricing`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/work`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/repairs`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/repairs/request`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/repairs/track`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/resources`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/careers`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/start-a-project`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/legal/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES
    .filter((s) => !s.isRepairService)
    .map((s) => ({ url: `${base}/solutions/${s.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = await getDb();
    const [projects, articles, vacancies] = await Promise.all([
      db.select({ slug: schema.portfolioProjects.slug, updatedAt: schema.portfolioProjects.updatedAt })
        .from(schema.portfolioProjects)
        .where(eq(schema.portfolioProjects.status, "published")),
      db.select({ slug: schema.articles.slug, updatedAt: schema.articles.updatedAt })
        .from(schema.articles)
        .where(and(eq(schema.articles.status, "published"), isNotNull(schema.articles.publishedAt), lte(schema.articles.publishedAt, now))),
      db.select({ slug: schema.vacancies.slug, updatedAt: schema.vacancies.updatedAt })
        .from(schema.vacancies)
        .where(eq(schema.vacancies.status, "published")),
    ]);

    dynamicRoutes = [
      ...projects.map((p) => ({ url: `${base}/work/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...articles.map((a) => ({ url: `${base}/resources/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...vacancies.map((v) => ({ url: `${base}/careers/${v.slug}`, lastModified: v.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
    ];
  } catch {
    // DB not reachable (e.g. build-time without DB configured) — static + service routes still return
  }

  return [...staticRoutes, ...serviceRoutes, ...dynamicRoutes];
}
