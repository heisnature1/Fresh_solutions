import { asc, eq } from "drizzle-orm";
import { apiHandler, HttpError, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { buildQuotationPdf } from "@/lib/pdf/documents";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/constants";

export const GET = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();

  const quotes = await db.select().from(schema.quotations).where(eq(schema.quotations.id, id)).limit(1);
  if (!quotes[0]) throw new HttpError("Quotation not found.", 404);
  const items = await db.select().from(schema.quotationItems).where(eq(schema.quotationItems.quotationId, id)).orderBy(asc(schema.quotationItems.sortOrder));

  const settings = await getSettings();
  const pdf = await buildQuotationPdf(quotes[0], items, {
    name: SITE_NAME,
    email: settings.contactEmail || undefined,
    phone: settings.contactPhone || undefined,
    location: settings.contactLocation || undefined,
  });

  const inline = new URL(req.url).searchParams.get("preview") === "1";
  return new Response(Buffer.from(pdf) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="quotation-${quotes[0].quoteNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
});

export const runtime = "nodejs";
