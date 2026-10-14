import { apiHandler, assertSameOrigin, jsonOk, parseJson, requireAdmin, jsonError } from "@/lib/api";
import { quotationSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { computeQuoteTotals } from "@/lib/pdf/documents";
import { newDocumentNumber } from "@/lib/documents";
import { clientIp, recordAudit } from "@/lib/audit";
import { getSettings } from "@/lib/settings";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, quotationSchema);
  if (input.items.length === 0) return jsonError("Add at least one line item.", 422);

  const db = await getDb();
  const quoteNumber = await newDocumentNumber("QT");
  const totals = computeQuoteTotals(
    input.items.map((i) => ({ quantity: String(i.quantity), unitPrice: String(i.unitPrice) })),
    input.discountType || null,
    input.discountValue === "" || input.discountValue === undefined ? null : String(input.discountValue),
    input.taxRate === "" || input.taxRate === undefined ? null : String(input.taxRate),
  );

  const [quote] = await db
    .insert(schema.quotations)
    .values({
      quoteNumber,
      inquiryId: input.inquiryId || null,
      clientName: input.clientName,
      clientOrganisation: input.clientOrganisation || null,
      clientEmail: input.clientEmail || null,
      clientPhone: input.clientPhone || null,
      clientAddress: input.clientAddress || null,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate || null,
      currency: input.currency,
      discountType: input.discountType || null,
      discountValue: input.discountValue === "" || input.discountValue === undefined ? null : String(input.discountValue),
      taxRate: input.taxRate === "" || input.taxRate === undefined ? null : String(input.taxRate),
      subtotal: String(totals.subtotal),
      total: String(totals.total),
      scopeOfWork: input.scopeOfWork || null,
      terms: input.terms || null,
      notes: input.notes || null,
      status: "draft",
      createdBy: admin.id,
    })
    .returning({ id: schema.quotations.id });

  if (input.items.length > 0) {
    await db.insert(schema.quotationItems).values(
      input.items.map((item, i) => ({
        quotationId: quote.id,
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        sortOrder: i,
      })),
    );
  }

  await recordAudit({ adminId: admin.id, action: "quotation.create", entity: "quotation", entityId: quoteNumber, ip: clientIp(req.headers) });
  return jsonOk({ id: quote.id, quoteNumber });
});

export const runtime = "nodejs";
