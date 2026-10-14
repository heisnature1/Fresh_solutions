import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New article", robots: { index: false } };

export default async function NewArticlePage() {
  const db = await getDb();
  const categories = await db.select().from(schema.articleCategories).orderBy(asc(schema.articleCategories.name));

  return (
    <>
      <PageHeader title="New article" description="Write with Markdown — preview before you publish. Articles go public only when published." />
      <ArticleEditor
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          title: "", slug: "", excerpt: "", content: "", categoryId: "", tagsCsv: "",
          authorName: "", featured: false, seoTitle: "", seoDescription: "", scheduledAt: "",
        }}
      />
    </>
  );
}
