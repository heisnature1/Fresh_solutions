import type { Metadata } from "next";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, SearchBar, Table, THead, Th, Td, RowLink, EmptyRow, filterSelectStyles } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { REPAIR_STATUSES, APPLIANCE_CATEGORIES, repairStatusLabel, applianceCategoryLabel } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Repairs", robots: { index: false } };

export default async function AdminRepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const settings = await getSettings();
  const conditions = [];
  if (params.status) conditions.push(eq(schema.repairRequests.status, params.status));
  if (params.category) conditions.push(eq(schema.repairRequests.applianceCategory, params.category));
  if (params.q) {
    const pattern = `%${params.q.replace(/[%_]/g, "")}%`;
    conditions.push(or(like(schema.repairRequests.reference, pattern), like(schema.repairRequests.customerName, pattern), like(schema.repairRequests.applianceType, pattern), like(schema.repairRequests.phone, pattern))!);
  }

  const rows = await db
    .select()
    .from(schema.repairRequests)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.repairRequests.createdAt))
    .limit(150);

  const openCount = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(schema.repairRequests)
    .where(sql`${schema.repairRequests.status} NOT IN ('completed', 'delivered', 'cancelled')`);

  return (
    <>
      <PageHeader
        title="Repair jobs"
        description={`${openCount[0]?.total ?? 0} active job(s). Customers track theirs at /repairs/track with reference + access code.`}
      />
      <SearchBar
        placeholder="Search reference, customer, appliance or phone…"
        defaultValue={params.q}
        filters={
          <>
            <select name="status" defaultValue={params.status ?? ""} className={filterSelectStyles} aria-label="Filter by status">
              <option value="">All statuses</option>
              {REPAIR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select name="category" defaultValue={params.category ?? ""} className={filterSelectStyles} aria-label="Filter by category">
              <option value="">All categories</option>
              {APPLIANCE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </>
        }
      />
      <Table minWidth={920}>
        <THead><Th>Reference</Th><Th>Customer</Th><Th>Appliance</Th><Th>Technician</Th><Th>Est. cost</Th><Th>Received</Th><Th>Status</Th></THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={7} message="No repair requests yet — the first one will appear here the moment someone uses the public form." />
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-mist-50">
                <Td><RowLink href={`/admin/repairs/${r.id}`}>{r.reference}</RowLink></Td>
                <Td>
                  <span className="block font-medium text-navy-900">{r.customerName}</span>
                  <span className="block text-xs text-mist-500">{r.phone}</span>
                </Td>
                <Td>
                  <span className="block">{r.applianceType}</span>
                  <span className="block text-xs text-mist-500">{applianceCategoryLabel(r.applianceCategory)}{[r.brand, r.model].filter(Boolean).length ? ` · ${[r.brand, r.model].filter(Boolean).join(" ")}` : ""}</span>
                </Td>
                <Td>{r.technician ?? "—"}</Td>
                <Td className="whitespace-nowrap">{r.estimatedCost ? formatMoney(r.estimatedCost, settings.defaultCurrency) : "—"}</Td>
                <Td className="whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
                <Td><Badge tone={statusTone(r.status)}>{repairStatusLabel(r.status)}</Badge></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
