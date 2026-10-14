import { asc, eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { buildQuotationPdf } from "@/lib/pdf/documents";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/constants";
import { emailConfigured, sendEmail } from "@/lib/email";
import { clientIp, recordAudit } from "@/lib/audit";

/** Emails the quotation PDF to the client. Fails honestly if SMTP is off. */
export const POST = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;

  if (!emailConfigured()) {
    return jsonError("Email is not configured. Set SMTP_* environment variables, then try again.", 409);
  }

  const db = await getDb();
  const quotes = await db.select().from(schema.quotations).where(eq(schema.quotations.id, id)).limit(1);
  if (!quotes[0]) return jsonError("Quotation not found.", 404);
  const quote = quotes[0];
  if (!quote.clientEmail) return jsonError("This quotation has no client email address.", 422);

  const items = await db.select().from(schema.quotationItems).where(eq(schema.quotationItems.quotationId, id)).orderBy(asc(schema.quotationItems.sortOrder));
  const settings = await getSettings();
  const pdf = await buildQuotationPdf(quote, items, {
    name: SITE_NAME,
    email: settings.contactEmail || undefined,
    phone: settings.contactPhone || undefined,
    location: settings.contactLocation || undefined,
  });

  // sendEmail logs to email_log; attach the PDF through a direct transport call.
  const nodemailer = (await import("nodemailer")).default;
  let sent = false;
  let error: string | undefined;
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM || "Fresh Solutions <no-reply@localhost>",
      to: quote.clientEmail,
      subject: `Quotation ${quote.quoteNumber} from Fresh Solutions`,
      text: `Hello ${quote.clientName},\n\nPlease find attached quotation ${quote.quoteNumber} from Fresh Solutions.\n\nTotal: ${quote.currency} ${quote.total}\n${quote.expiryDate ? `Valid until: ${quote.expiryDate}\n` : ""}\nTo accept or discuss this quotation, simply reply to this email.\n\n— Fresh Solutions`,
      attachments: [
        { filename: `quotation-${quote.quoteNumber}.pdf`, content: Buffer.from(pdf), contentType: "application/pdf" },
      ],
    });
    sent = true;
  } catch (err) {
    error = err instanceof Error ? err.message.slice(0, 250) : "Unknown error";
  }

  await db.insert(schema.emailLog).values({
    toAddress: quote.clientEmail,
    subject: `Quotation ${quote.quoteNumber}`,
    template: "quotation_pdf",
    status: sent ? "sent" : "failed",
    error: error ?? null,
  });

  if (!sent) return jsonError(`Email delivery failed: ${error}. The quotation is unchanged.`, 502);

  await db
    .update(schema.quotations)
    .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.quotations.id, id));
  await recordAudit({ adminId: admin.id, action: "quotation.email", entity: "quotation", entityId: quote.quoteNumber, ip: clientIp(req.headers) });

  return jsonOk({ message: `Quotation emailed to ${quote.clientEmail} and marked as sent.` });
});

export const runtime = "nodejs";
