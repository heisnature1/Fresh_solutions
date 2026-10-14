import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ArticleActions } from "@/components/admin/ArticleActions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit article", robots: { index: false } };

export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const rows = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).limit(1);
  if (!rows[0]) notFound();
  const article = rows[0];

  const [categories, tags] = await Promise.all([
    db.select().from(schema.articleCategories).orderBy(asc(schema.articleCategories.name)),
    db.select({ name: schema.tags.name })
      .from(schema.articleTags)
      .innerJoin(schema.tags, eq(schema.articleTags.tagId, schema.tags.id))
      .where(eq(schema.articleTags.articleId, id)),
  ]);

  return (
    <>
      <PageHeader
        title={article.title}
        description={`Created ${formatDateTime(article.createdAt)}${article.publishedAt ? ` · published ${formatDateTime(article.publishedAt)}` : ""} · /knowledge/${article.slug}`}
      />
      <ArticleActions articleId={article.id} status={article.status} slug={article.slug} />
      <ArticleEditor
        mode="edit"
        articleId={article.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          content: article.content,
          categoryId: article.categoryId ?? "",
          tagsCsv: tags.map((t) => t.name).join(", "),
          authorName: article.authorName ?? "",
          featured: article.featured,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          scheduledAt: article.scheduledAt ? article.scheduledAt.toISOString().slice(0, 10) : "",
        }}
      />
    </>
  );
}
