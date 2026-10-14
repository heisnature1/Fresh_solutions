import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, like } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { getService } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portfolio", robots: { index: false } };

const STATUS_TONES: Record<string, "green" | "amber" | "slate"> = { published: "green", draft: "amber", archived: "slate" };

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.portfolioProjects.status, params.status));
  if (params.q) conditions.push(like(schema.portfolioProjects.title, `%${params.q.replace(/[%_]/g, "")}%`));

  const rows = await db
    .select()
    .from(schema.portfolioProjects)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.portfolioProjects.updatedAt))
    .limit(150);

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Case studies for the public portfolio. Only real, completed work goes here."
        actions={
          <Link href="/admin/portfolio/new" className="inline-flex items-center gap-2 rounded-xl bg-electric-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-electric-500">
            <Icon name="plus" className="h-4 w-4" /> New project
          </Link>
        }
      />
      <SearchBar
        placeholder="Search projects…"
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
        <THead><Th>Title</Th><Th>Category</Th><Th>Slug</Th><Th>Updated</Th><Th>Status</Th></THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5} message="No projects yet. The public portfolio shows an honest 'case studies in preparation' note until the first one is published." />
          ) : (
            rows.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-mist-50">
                <Td>
                  <RowLink href={`/admin/portfolio/${p.id}`}>{p.title}</RowLink>
                  {p.featured ? <span className="ml-2 text-xs font-semibold text-amber-600">★ Featured</span> : null}
                </Td>
                <Td>{p.category ? getService(p.category)?.name ?? p.category : "—"}</Td>
                <Td className="font-mono text-xs">{p.slug}</Td>
                <Td className="whitespace-nowrap">{formatDateTime(p.updatedAt)}</Td>
                <Td><Badge tone={STATUS_TONES[p.status] ?? "slate"}>{p.status}</Badge></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
