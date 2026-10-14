import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { employmentTypeLabel } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recruitment", robots: { index: false } };

const STATUS_TONES: Record<string, "green" | "amber" | "slate"> = { published: "green", draft: "amber", closed: "slate" };

export default async function AdminCareersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.vacancies.status, params.status));
  if (params.q) {
    const pattern = `%${params.q.replace(/[%_]/g, "")}%`;
    conditions.push(or(like(schema.vacancies.title, pattern), like(schema.vacancies.department, pattern))!);
  }

  const appCounts = db
    .select({ id: schema.applications.vacancyId, total: sql<number>`count(*)::int` })
    .from(schema.applications)
    .groupBy(schema.applications.vacancyId)
    .as("app_counts");

  const rows = await db
    .select({ v: schema.vacancies, applications: appCounts.total })
    .from(schema.vacancies)
    .leftJoin(appCounts, eq(appCounts.id, schema.vacancies.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.vacancies.updatedAt))
    .limit(150);

  const totalApplications = await db.select({ total: sql<number>`count(*)::int` }).from(schema.applications);

  return (
    <>
      <PageHeader
        title="Recruitment"
        description={`Vacancies and applications. ${totalApplications[0]?.total ?? 0} application(s) received in total — CVs and cover letters stay private and are never exposed publicly.`}
        actions={
          <Link href="/admin/careers/new" className="inline-flex items-center gap-2 rounded-xl bg-electric-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-electric-500">
            <Icon name="plus" className="h-4 w-4" /> New vacancy
          </Link>
        }
      />
      <SearchBar
        placeholder="Search vacancies…"
        defaultValue={params.q}
        filters={
          <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="published">Open (published)</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        }
      />
      <Table minWidth={820}>
        <THead><Th>Vacancy</Th><Th>Department</Th><Th>Type</Th><Th>Deadline</Th><Th>Applications</Th><Th>Status</Th></THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={6} message="No vacancies yet. The public careers page clearly states when no positions are open — it never invents roles." />
          ) : (
            rows.map(({ v, applications }) => (
              <tr key={v.id} className="transition-colors hover:bg-mist-50">
                <Td>
                  <RowLink href={`/admin/careers/${v.id}`}>{v.title}</RowLink>
                  {v.location ? <span className="block text-xs text-mist-500">{v.location}</span> : null}
                </Td>
                <Td>{v.department ?? "—"}</Td>
                <Td>{v.employmentType ? employmentTypeLabel(v.employmentType) : "—"}</Td>
                <Td className="whitespace-nowrap">{v.deadline ? formatDate(v.deadline) : "—"}</Td>
                <Td>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(applications ?? 0) > 0 ? "bg-electric-100 text-electric-700" : "bg-mist-100 text-mist-600"}`}>
                    {applications ?? 0}
                  </span>
                </Td>
                <Td><Badge tone={STATUS_TONES[v.status] ?? "slate"}>{v.status}</Badge></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <p className="mt-3 text-xs text-mist-400">Last vacancy update shown; deleting a vacancy also removes its applications and uploaded CV files.</p>
    </>
  );
}
