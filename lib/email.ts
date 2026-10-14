import { getDb, schema } from "./db/client";

/**
 * Transactional email via SMTP (nodemailer). If SMTP is not configured the
 * sender reports "skipped_unconfigured" honestly instead of pretending mail
 * went out, and every attempt is recorded in the email_log table.
 */

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

export function emailStatus(): { configured: boolean; note: string } {
  if (emailConfigured()) {
    return { configured: true, note: `SMTP configured (${process.env.SMTP_HOST}).` };
  }
  return {
    configured: false,
    note: "SMTP not configured — set SMTP_HOST/SMTP_USER/SMTP_PASS to enable email confirmations and notifications. Nothing is being sent.",
  };
}

function from(): string {
  return process.env.SMTP_FROM || "Fresh Solutions <no-reply@localhost>";
}

export function adminNotifyAddress(fallback?: string): string | null {
  return process.env.ADMIN_NOTIFY_EMAIL || fallback || process.env.ADMIN_EMAIL || null;
}

export interface SendResult {
  status: "sent" | "failed" | "skipped_unconfigured";
  error?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  template?: string;
}): Promise<SendResult> {
  let result: SendResult;

  if (!emailConfigured()) {
    result = { status: "skipped_unconfigured" };
  } else {
    try {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
      await transport.sendMail({
        from: from(),
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      });
      result = { status: "sent" };
    } catch (err) {
      // Log the failure honestly; never leak credentials into messages.
      result = {
        status: "failed",
        error: err instanceof Error ? err.message.slice(0, 300) : "Unknown SMTP error",
      };
    }
  }

  try {
    const db = await getDb();
    await db.insert(schema.emailLog).values({
      toAddress: opts.to,
      subject: opts.subject.slice(0, 380),
      template: opts.template ?? null,
      status: result.status,
      error: result.error ?? null,
    });
  } catch {
    /* logging must never break the request */
  }

  return result;
}

// ---------------------------------------------------------------------------
// Simple branded plain-text + minimal HTML templates
// ---------------------------------------------------------------------------

function brandHtml(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#0a1633;color:#fff;padding:18px 24px;border-radius:10px 10px 0 0;">
      <strong style="font-size:18px;">Fresh Solutions</strong>
      <div style="font-size:12px;color:#9fb3d9;">Engineering the Future. Empowering Progress.</div>
    </div>
    <div style="background:#ffffff;padding:24px;border:1px solid #e3e8f2;border-top:none;border-radius:0 0 10px 10px;">
      <h1 style="font-size:17px;margin:0 0 12px;color:#0a1633;">${title}</h1>
      <div style="font-size:14px;color:#33415c;line-height:1.6;">${body}</div>
    </div>
  </div></body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendSubmissionConfirmation(opts: {
  to: string;
  name: string;
  reference: string;
  kindLabel: string;
}): Promise<SendResult> {
  const bodyText = `Hello ${opts.name},\n\nThank you for contacting Fresh Solutions. We have received your ${opts.kindLabel}.\n\nYour reference: ${opts.reference}\n\nPlease keep this reference — our team will review your submission and respond using your preferred contact method.\n\n— Fresh Solutions`;
  const bodyHtml = `<p>Hello ${escapeHtml(opts.name)},</p>
    <p>Thank you for contacting <strong>Fresh Solutions</strong>. We have received your ${escapeHtml(opts.kindLabel)}.</p>
    <p>Your reference: <strong style="font-size:16px;letter-spacing:1px;">${escapeHtml(opts.reference)}</strong></p>
    <p>Please keep this reference. Our team will review your submission and respond using your preferred contact method.</p>
    <p style="color:#6b7a99;">— Fresh Solutions</p>`;
  return sendEmail({
    to: opts.to,
    subject: `We received your ${opts.kindLabel} — ${opts.reference}`,
    text: bodyText,
    html: brandHtml(`Your ${escapeHtml(opts.kindLabel)} was received`, bodyHtml),
    template: "submission_confirmation",
  });
}

export async function sendAdminNotification(opts: {
  notifyTo: string | null;
  subject: string;
  lines: string[];
}): Promise<SendResult | null> {
  if (!opts.notifyTo) return null;
  const text = `${opts.subject}\n\n${opts.lines.join("\n")}`;
  const html = brandHtml(
    escapeHtml(opts.subject),
    `<ul style="margin:0;padding-left:18px;">${opts.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`,
  );
  return sendEmail({ to: opts.notifyTo, subject: `[Fresh Solutions] ${opts.subject}`, text, html, template: "admin_notification" });
}
