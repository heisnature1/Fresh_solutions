import type { Metadata } from "next";
import Link from "next/link";
import { asc, and, desc, eq, like } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { CategoryAdder } from "@/components/admin/CategoryAdder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Knowledge centre", robots: { index: false } };

const STATUS_TONES: Record<string, "green" | "amber" | "slate"> = { published: "green", draft: "amber", archived: "slate" };

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.articles.status, params.status));
  if (params.q) conditions.push(like(schema.articles.title, `%${params.q.replace(/[%_]/g, "")}%`));

  const [rows, categories] = await Promise.all([
    db.select({ a: schema.articles, categoryName: schema.articleCategories.name })
      .from(schema.articles)
      .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(schema.articles.updatedAt))
      .limit(150),
    db.select().from(schema.articleCategories).orderBy(asc(schema.articleCategories.name)),
  ]);

  return (
    <>
      <PageHeader
        title="Knowledge centre"
        description="Markdown articles for the public knowledge centre. Drafts are never shown publicly."
        actions={
          <Link href="/admin/articles/new" className="inline-flex items-center gap-2 rounded-xl bg-electric-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-electric-500">
            <Icon name="plus" className="h-4 w-4" /> New article
          </Link>
        }
      />
      <div className="mb-5 rounded-2xl border border-mist-200 bg-white p-4 shadow-card">
        <CategoryAdder existing={categories.map((c) => c.name)} />
      </div>
      <SearchBar
        placeholder="Search articles…"
        defaultValue={params.q}
        filters={
          <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        }
      />
      <Table minWidth={720}>
        <THead><Th>Title</Th><Th>Category</Th><Th>Updated</Th><Th>Published</Th><Th>Status</Th></THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5} message="No articles yet. The public knowledge centre shows an honest 'articles coming soon' note until the first one is published." />
          ) : (
            rows.map(({ a, categoryName }) => (
              <tr key={a.id} className="transition-colors hover:bg-mist-50">
                <Td>
                  <RowLink href={`/admin/articles/${a.id}`}>{a.title}</RowLink>
                  {a.featured ? <span className="ml-2 text-xs font-semibold text-amber-600">★</span> : null}
                </Td>
                <Td>{categoryName ?? "—"}</Td>
                <Td className="whitespace-nowrap">{formatDateTime(a.updatedAt)}</Td>
                <Td className="whitespace-nowrap">{a.publishedAt ? formatDateTime(a.publishedAt) : "—"}</Td>
                <Td><Badge tone={STATUS_TONES[a.status] ?? "slate"}>{a.status}</Badge></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
