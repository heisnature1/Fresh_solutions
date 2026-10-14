import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { buildProposalPdf } from "@/lib/pdf/documents";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/constants";
import { emailConfigured } from "@/lib/email";
import { clientIp, recordAudit } from "@/lib/audit";

/** Emails the proposal PDF to the client. Fails honestly if SMTP is off. */
export const POST = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;

  if (!emailConfigured()) {
    return jsonError("Email is not configured. Set SMTP_* environment variables, then try again.", 409);
  }

  const db = await getDb();
  const rows = await db.select().from(schema.proposals).where(eq(schema.proposals.id, id)).limit(1);
  if (!rows[0]) return jsonError("Proposal not found.", 404);
  const proposal = rows[0];
  if (!proposal.clientEmail) return jsonError("This proposal has no client email address.", 422);

  const settings = await getSettings();
  const pdf = await buildProposalPdf(proposal, {
    name: SITE_NAME,
    email: settings.contactEmail || undefined,
    phone: settings.contactPhone || undefined,
    location: settings.contactLocation || undefined,
  });

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
      to: proposal.clientEmail,
      subject: `Proposal ${proposal.proposalNumber}: ${proposal.title}`,
      text: `Hello ${proposal.clientName},\n\nPlease find attached project proposal ${proposal.proposalNumber} ("${proposal.title}") from Fresh Solutions.\n\nThis proposal is valid for ${proposal.validityDays ?? 30} days from its issue date. To accept or discuss it, simply reply to this email.\n\n— Fresh Solutions`,
      attachments: [
        { filename: `proposal-${proposal.proposalNumber}.pdf`, content: Buffer.from(pdf), contentType: "application/pdf" },
      ],
    });
    sent = true;
  } catch (err) {
    error = err instanceof Error ? err.message.slice(0, 250) : "Unknown error";
  }

  await db.insert(schema.emailLog).values({
    toAddress: proposal.clientEmail,
    subject: `Proposal ${proposal.proposalNumber}`,
    template: "proposal_pdf",
    status: sent ? "sent" : "failed",
    error: error ?? null,
  });

  if (!sent) return jsonError(`Email delivery failed: ${error}. The proposal is unchanged.`, 502);

  await db.update(schema.proposals).set({ status: "sent", updatedAt: new Date() }).where(eq(schema.proposals.id, id));
  await recordAudit({ adminId: admin.id, action: "proposal.email", entity: "proposal", entityId: proposal.proposalNumber, ip: clientIp(req.headers) });
  return jsonOk({ message: `Proposal emailed to ${proposal.clientEmail} and marked as sent.` });
});

export const runtime = "nodejs";
