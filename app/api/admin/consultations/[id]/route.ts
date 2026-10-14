import { eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { consultationUpdateSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = await parseJson(req, consultationUpdateSchema);

  const db = await getDb();
  const existing = await db.select().from(schema.consultations).where(eq(schema.consultations.id, id)).limit(1);
  if (!existing[0]) return jsonError("Consultation not found.", 404);

  let confirmedAt: Date | null = existing[0].confirmedAt;
  if (input.status === "approved") {
    if (!input.confirmedAt) return jsonError("Set the confirmed date when approving a consultation.", 422);
    confirmedAt = new Date(`${input.confirmedAt}T${input.confirmedTime?.trim() || "09:00"}:00`);
  }
  if (input.status !== "approved") confirmedAt = input.status === "pending" ? null : confirmedAt;

  await db
    .update(schema.consultations)
    .set({
      status: input.status,
      confirmedAt,
      adminNotes: input.adminNotes ?? existing[0].adminNotes,
      updatedAt: new Date(),
    })
    .where(eq(schema.consultations.id, id));

  // Honest notification when an email channel exists; the send result is logged.
  let emailNote: string | undefined;
  if (input.status === "approved" && confirmedAt) {
    const result = await sendEmail({
      to: existing[0].email,
      subject: `Consultation confirmed — ${existing[0].reference}`,
      text: `Hello ${existing[0].name},\n\nYour consultation with Fresh Solutions has been confirmed.\n\nTopic: ${existing[0].topic}\nConfirmed for: ${confirmedAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}\nReference: ${existing[0].reference}\n\nIf this time no longer works, reply to this email or contact us.\n\n— Fresh Solutions`,
      template: "consultation_confirmed",
    });
    emailNote = result.status === "sent" ? "Confirmation email sent." : result.status === "failed" ? "Email delivery failed — see email log." : "Email not configured — notify the customer manually.";
  }

  await recordAudit({
    adminId: admin.id,
    action: "consultation.update",
    entity: "consultation",
    entityId: existing[0].reference,
    meta: { status: input.status },
    ip: clientIp(req.headers),
  });

  return jsonOk({ emailNote });
});

export const runtime = "nodejs";
