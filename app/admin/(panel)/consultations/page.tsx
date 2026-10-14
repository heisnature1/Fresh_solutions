import type { Metadata } from "next";
import { and, desc, eq, like, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { CONSULTATION_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consultations", robots: { index: false } };

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.consultations.status, params.status));
  if (params.q) {
    const pattern = `%${params.q.replace(/[%_]/g, "")}%`;
    conditions.push(or(like(schema.consultations.reference, pattern), like(schema.consultations.name, pattern), like(schema.consultations.topic, pattern))!);
  }

  const rows = await db
    .select()
    .from(schema.consultations)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.consultations.createdAt))
    .limit(150);

  return (
    <>
      <PageHeader
        title="Consultations"
        description="Every consultation request. Approve with a confirmed time — the customer is notified by your reply (and by email if SMTP is configured)."
      />
      <SearchBar
        placeholder="Search reference, name or topic…"
        defaultValue={params.q}
        filters={
          <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
            <option value="">All statuses</option>
            {CONSULTATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        }
      />
      <Table minWidth={760}>
        <THead><Th>Reference</Th><Th>Customer</Th><Th>Topic</Th><Th>Preferred window</Th><Th>Received</Th><Th>Status</Th></THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={6} message="No consultation requests yet." />
          ) : (
            rows.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-mist-50">
                <Td><RowLink href={`/admin/consultations/${c.id}`}>{c.reference}</RowLink></Td>
                <Td>
                  <span className="block font-medium text-navy-900">{c.name}</span>
                  <span className="block text-xs text-mist-500">{c.email}</span>
                </Td>
                <Td className="max-w-[240px] truncate">{c.topic}</Td>
                <Td>{c.preferredWindow}</Td>
                <Td className="whitespace-nowrap">{formatDateTime(c.createdAt)}</Td>
                <Td><Badge tone={statusTone(c.status)}>{c.status}</Badge></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
