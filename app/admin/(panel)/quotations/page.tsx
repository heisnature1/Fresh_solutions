import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, like, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { QUOTE_STATUSES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { isAutoExpired } from "@/lib/documents";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quotations", robots: { index: false } };

export default async function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.quotations.status, params.status));
  if (params.q) {
    const pattern = `%${params.q.replace(/[%_]/g, "")}%`;
    conditions.push(or(like(schema.quotations.quoteNumber, pattern), like(schema.quotations.clientName, pattern), like(schema.quotations.clientOrganisation, pattern))!);
  }

  const rows = await db
    .select()
    .from(schema.quotations)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.quotations.createdAt))
    .limit(150);

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Draft, send, and track quotations. Totals always come from server-side calculation."
        actions={
          <Link href="/admin/quotations/new" className="inline-flex items-center gap-2 rounded-xl bg-electric-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-electric-500">
            <Icon name="plus" className="h-4 w-4" /> New quotation
          </Link>
        }
      />
      <SearchBar
        placeholder="Search number or client…"
        defaultValue={params.q}
        filters={
          <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
            <option value="">All statuses</option>
            {QUOTE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        }
      />
      <Table minWidth={860}>
        <THead>
          <Th>Number</Th><Th>Client</Th><Th>Issued</Th><Th>Expiry</Th><Th>Total</Th><Th>Status</Th><Th>Payment</Th>
        </THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={7} message="No quotations yet — create the first one from an inquiry or from scratch." />
          ) : (
            rows.map((q) => {
              const expired = isAutoExpired(q.expiryDate, q.status);
              return (
                <tr key={q.id} className="transition-colors hover:bg-mist-50">
                  <Td><RowLink href={`/admin/quotations/${q.id}`}>{q.quoteNumber}</RowLink></Td>
                  <Td>
                    <span className="block font-medium text-navy-900">{q.clientName}</span>
                    {q.clientOrganisation ? <span className="block text-xs text-mist-500">{q.clientOrganisation}</span> : null}
                  </Td>
                  <Td className="whitespace-nowrap">{formatDate(q.issueDate)}</Td>
                  <Td className="whitespace-nowrap">{q.expiryDate ? formatDate(q.expiryDate) : "—"}</Td>
                  <Td className="whitespace-nowrap font-semibold">{formatMoney(q.total, q.currency)}</Td>
                  <Td>
                    <Badge tone={expired ? "slate" : statusTone(q.status)}>
                      {expired ? "Expired" : QUOTE_STATUSES.find((s) => s.value === q.status)?.label ?? q.status}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-mist-500">{q.paymentStatus === "unpaid" ? "No payment recorded" : q.paymentStatus}</Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
      <p className="mt-3 text-xs text-mist-400">
        Online payments are not part of this release — payment status stays "unpaid" until a verified payment gateway is integrated.
      </p>
    </>
  );
}
