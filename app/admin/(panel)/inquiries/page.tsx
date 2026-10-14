import type { Metadata } from "next";
import { and, desc, eq, like, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { INQUIRY_STATUSES, inquiryStatusLabel } from "@/lib/constants";
import { formatDateTime, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiries", robots: { index: false } };

const PAGE_SIZE = 20;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const db = await getDb();

  const conditions = [];
  if (params.status) conditions.push(eq(schema.inquiries.status, params.status));
  if (params.q) {
    const pattern = `%${params.q.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(
        like(schema.inquiries.reference, pattern),
        like(schema.inquiries.name, pattern),
        like(schema.inquiries.email, pattern),
        like(schema.inquiries.title, pattern),
        like(schema.inquiries.organisation, pattern),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(schema.inquiries)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.inquiries.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status) sp.set("status", params.status);
    if (p > 1) sp.set("page", String(p));
    return `/admin/inquiries${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Inquiries" description="Project inquiries, quotation requests, and contact messages." />
      <SearchBar
        placeholder="Search reference, name, email, title…"
        defaultValue={params.q}
        filters={
          <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
            <option value="">All statuses</option>
            {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        }
      />
      <Table minWidth={820}>
        <THead>
          <Th>Reference</Th><Th>From</Th><Th>Type</Th><Th>Subject / Services</Th><Th>Status</Th><Th>Received</Th>
        </THead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={6} message="No inquiries match your filters." />
          ) : (
            items.map((i) => (
              <tr key={i.id} className="transition-colors hover:bg-mist-50">
                <Td><RowLink href={`/admin/inquiries/${i.id}`}>{i.reference}</RowLink></Td>
                <Td>
                  <span className="block font-medium text-navy-900">{i.name}</span>
                  <span className="block text-xs text-mist-500">{i.email}</span>
                </Td>
                <Td className="capitalize">{i.kind.replace("_", " ")}</Td>
                <Td className="max-w-[240px]">
                  <span className="block truncate">{i.title ? truncate(i.title, 60) : "—"}</span>
                  <span className="block truncate text-xs text-mist-500">{(i.services ?? []).join(", ")}</span>
                </Td>
                <Td><Badge tone={statusTone(i.status)}>{inquiryStatusLabel(i.status)}</Badge></Td>
                <Td className="whitespace-nowrap text-xs">{formatDateTime(i.createdAt)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <div className="mt-4 flex gap-2.5">
        {page > 1 ? <a className="text-sm font-semibold text-electric-600" href={qs(page - 1)}>← Newer</a> : null}
        {hasMore ? <a className="text-sm font-semibold text-electric-600" href={qs(page + 1)}>Older →</a> : null}
      </div>
    </>
  );
}
