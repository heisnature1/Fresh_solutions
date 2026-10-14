import { apiHandler, checkRateLimit, honeypotReject, jsonOk, parseJson } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { newReference } from "@/lib/refs";
import { sendSubmissionConfirmation, sendAdminNotification, adminNotifyAddress } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { clientIp } from "@/lib/audit";

export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:contact", 5, 600);
  const input = await parseJson(req, contactSchema);
  if (honeypotReject(input.website)) return jsonOk({}); // silently accept bot spam

  const db = await getDb();
  const reference = newReference("MSG");
  await db.insert(schema.inquiries).values({
    reference,
    kind: "contact",
    name: input.name,
    organisation: input.organisation || null,
    email: input.email,
    phone: input.phone || null,
    preferredContact: input.preferredContact ?? "email",
    title: input.subject,
    message: input.message,
    status: "new",
  });

  const settings = await getSettings();
  await sendSubmissionConfirmation({ to: input.email, name: input.name, reference, kindLabel: "message" });
  await sendAdminNotification({
    notifyTo: adminNotifyAddress(settings.notifyEmail || undefined),
    subject: "New contact message",
    lines: [`Reference: ${reference}`, `From: ${input.name} <${input.email}>`, `Subject: ${input.subject}`],
  });

  return jsonOk({ reference });
});

export const runtime = "nodejs";
