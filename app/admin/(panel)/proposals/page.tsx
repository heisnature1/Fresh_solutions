import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, like, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { DOCUMENT_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proposals", robots: { index: false } };

export default async function AdminProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.proposals.status, params.status));
  if (params.q) {
    const pattern = `%${params.q.replace(/[%_]/g, "")}%`;
    conditions.push(or(like(schema.proposals.proposalNumber, pattern), like(schema.proposals.clientName, pattern), like(schema.proposals.title, pattern))!);
  }

  const rows = await db
    .select()
    .from(schema.proposals)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.proposals.createdAt))
    .limit(150);

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Full project proposals with structured sections and PDF generation."
        actions={
          <Link href="/admin/proposals/new" className="inline-flex items-center gap-2 rounded-xl bg-electric-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-electric-500">
            <Icon name="plus" className="h-4 w-4" /> New proposal
          </Link>
        }
      />
      <SearchBar
        placeholder="Search number, client or title…"
        defaultValue={params.q}
        filters={
          <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
            <option value="">All statuses</option>
            {DOCUMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        }
      />
      <Table minWidth={780}>
        <THead><Th>Number</Th><Th>Title</Th><Th>Client</Th><Th>Created</Th><Th>Status</Th></THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5} message="No proposals yet — create one from an inquiry or from scratch." />
          ) : (
            rows.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-mist-50">
                <Td><RowLink href={`/admin/proposals/${p.id}`}>{p.proposalNumber}</RowLink></Td>
                <Td className="max-w-xs truncate font-medium text-navy-900">{p.title}</Td>
                <Td>
                  <span className="block font-medium text-navy-900">{p.clientName}</span>
                  {p.clientOrganisation ? <span className="block text-xs text-mist-500">{p.clientOrganisation}</span> : null}
                </Td>
                <Td className="whitespace-nowrap">{formatDateTime(p.createdAt)}</Td>
                <Td><Badge tone={statusTone(p.status)}>{DOCUMENT_STATUSES.find((s) => s.value === p.status)?.label ?? p.status}</Badge></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
