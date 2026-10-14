import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, InfoCard, DetailRow, Table, THead, Th, Td, RowLink } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { QuotationEditor } from "@/components/admin/QuotationEditor";
import { QUOTE_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { isAutoExpired } from "@/lib/documents";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quotation", robots: { index: false } };

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const settings = await getSettings();

  const rows = await db.select().from(schema.quotations).where(eq(schema.quotations.id, id)).limit(1);
  if (!rows[0]) notFound();
  const quote = rows[0];
  const items = await db.select().from(schema.quotationItems).where(eq(schema.quotationItems.quotationId, id)).orderBy(asc(schema.quotationItems.sortOrder));

  let inquiry = null;
  if (quote.inquiryId) {
    const inq = await db.select().from(schema.inquiries).where(eq(schema.inquiries.id, quote.inquiryId)).limit(1);
    inquiry = inq[0] ?? null;
  }

  const expired = isAutoExpired(quote.expiryDate, quote.status);
  const statusLabel = expired ? "Expired" : QUOTE_STATUSES.find((s) => s.value === quote.status)?.label ?? quote.status;
  const discount = Number(quote.discountValue ?? 0);
  const discountAmount =
    quote.discountType === "percent"
      ? (Number(quote.subtotal) * discount) / 100
      : quote.discountType === "fixed"
        ? discount
        : 0;

  return (
    <>
      <PageHeader
        title={`Quotation ${quote.quoteNumber}`}
        description={`Created ${formatDateTime(quote.createdAt)}`}
        actions={<Badge tone={expired ? "slate" : statusTone(quote.status)} className="px-3 py-1.5 text-sm">{statusLabel}</Badge>}
      />

      {quote.status === "draft" ? (
        <QuotationEditor
          mode="edit"
          quoteId={quote.id}
          defaultTerms={settings.quoteTerms}
          initial={{
            inquiryId: quote.inquiryId ?? "",
            clientName: quote.clientName,
            clientOrganisation: quote.clientOrganisation ?? "",
            clientEmail: quote.clientEmail ?? "",
            clientPhone: quote.clientPhone ?? "",
            clientAddress: quote.clientAddress ?? "",
            issueDate: quote.issueDate,
            expiryDate: quote.expiryDate ?? "",
            currency: quote.currency,
            discountType: quote.discountType ?? "",
            discountValue: quote.discountValue ?? "",
            taxRate: quote.taxRate ?? "",
            scopeOfWork: quote.scopeOfWork ?? "",
            terms: quote.terms ?? "",
            notes: quote.notes ?? "",
            items: items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice })),
          }}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <InfoCard title="Client & dates">
              <dl className="divide-y divide-mist-100">
                <DetailRow label="Client" value={`${quote.clientName}${quote.clientOrganisation ? ` — ${quote.clientOrganisation}` : ""}`} />
                <DetailRow label="Email" value={quote.clientEmail} />
                <DetailRow label="Phone" value={quote.clientPhone} />
                <DetailRow label="Address" value={quote.clientAddress} />
                <DetailRow label="Issued" value={formatDate(quote.issueDate)} />
                <DetailRow label="Valid until" value={quote.expiryDate ? formatDate(quote.expiryDate) : "—"} />
                {quote.sentAt ? <DetailRow label="Sent" value={formatDateTime(quote.sentAt)} /> : null}
                {inquiry ? (
                  <DetailRow label="Linked inquiry" value={<Link href={`/admin/inquiries/${inquiry.id}`} className="text-electric-700 underline underline-offset-2">{inquiry.reference}</Link>} />
                ) : null}
                <DetailRow label="Payment" value={<span className="text-mist-600">No payment recorded (online payments are not part of this release)</span>} />
              </dl>
            </InfoCard>

            <InfoCard title="Line items">
              <Table minWidth={560}>
                <THead><Th>Description</Th><Th className="text-right">Qty</Th><Th className="text-right">Unit</Th><Th className="text-right">Amount</Th></THead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <Td>{it.description}</Td>
                      <Td className="text-right">{Number(it.quantity)}</Td>
                      <Td className="text-right">{formatMoney(it.unitPrice, quote.currency)}</Td>
                      <Td className="text-right">{formatMoney(Number(it.quantity) * Number(it.unitPrice), quote.currency)}</Td>
                    </tr>
                  ))}
                  <tr>
                    <Td colSpan={3} className="text-right font-semibold text-mist-600">Subtotal</Td>
                    <Td className="text-right font-semibold">{formatMoney(quote.subtotal, quote.currency)}</Td>
                  </tr>
                  {discountAmount > 0 ? (
                    <tr>
                      <Td colSpan={3} className="text-right font-semibold text-mist-600">
                        Discount{quote.discountType === "percent" ? ` (${Number(quote.discountValue)}%)` : ""}
                      </Td>
                      <Td className="text-right font-semibold">−{formatMoney(discountAmount, quote.currency)}</Td>
                    </tr>
                  ) : null}
                  {Number(quote.taxRate ?? 0) > 0 ? (
                    <tr>
                      <Td colSpan={3} className="text-right font-semibold text-mist-600">Tax ({Number(quote.taxRate)}%)</Td>
                      <Td className="text-right font-semibold">
                        {formatMoney((Number(quote.total) - Number(quote.subtotal) + discountAmount), quote.currency)}
                      </Td>
                    </tr>
                  ) : null}
                  <tr>
                    <Td colSpan={3} className="text-right font-display text-base font-bold text-navy-900">Total</Td>
                    <Td className="text-right font-display text-base font-bold text-navy-900">{formatMoney(quote.total, quote.currency)}</Td>
                  </tr>
                </tbody>
              </Table>
            </InfoCard>

            {quote.scopeOfWork ? <InfoCard title="Scope of work"><p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-700">{quote.scopeOfWork}</p></InfoCard> : null}
            {quote.terms ? <InfoCard title="Terms & conditions"><p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-700">{quote.terms}</p></InfoCard> : null}
            {quote.notes ? <InfoCard title="Internal notes"><p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-700">{quote.notes}</p></InfoCard> : null}
          </div>
          <DocumentActions kind="quotations" id={quote.id} status={quote.status} />
        </div>
      )}
    </>
  );
}
