import { asc, eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { quotationSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { computeQuoteTotals } from "@/lib/pdf/documents";
import { clientIp, recordAudit } from "@/lib/audit";

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, quotationSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.quotations).where(eq(schema.quotations.id, id)).limit(1);
  if (!existing[0]) return jsonError("Quotation not found.", 404);
  if (existing[0].status !== "draft") {
    return jsonError("Only draft quotations can be edited. Revert it to draft first if you need changes.", 409);
  }

  const totals = computeQuoteTotals(
    input.items.map((i) => ({ quantity: String(i.quantity), unitPrice: String(i.unitPrice) })),
    input.discountType || null,
    input.discountValue === "" || input.discountValue === undefined ? null : String(input.discountValue),
    input.taxRate === "" || input.taxRate === undefined ? null : String(input.taxRate),
  );

  await db
    .update(schema.quotations)
    .set({
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
      updatedAt: new Date(),
    })
    .where(eq(schema.quotations.id, id));

  await db.delete(schema.quotationItems).where(eq(schema.quotationItems.quotationId, id));
  if (input.items.length > 0) {
    await db.insert(schema.quotationItems).values(
      input.items.map((item, i) => ({
        quotationId: id,
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        sortOrder: i,
      })),
    );
  }

  await recordAudit({ adminId: admin.id, action: "quotation.update", entity: "quotation", entityId: existing[0].quoteNumber, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
