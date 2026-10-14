import { apiHandler, checkRateLimit, honeypotReject, jsonOk, parseJson } from "@/lib/api";
import { consultationSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { newReference } from "@/lib/refs";
import { sendSubmissionConfirmation, sendAdminNotification, adminNotifyAddress } from "@/lib/email";
import { getSettings } from "@/lib/settings";

/**
 * Consultation requests — these stay "pending" until an administrator
 * confirms them; the API never presents them as confirmed bookings.
 */
export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:consultation", 5, 600);
  const input = await parseJson(req, consultationSchema);
  if (honeypotReject(input.website)) return jsonOk({});

  const db = await getDb();
  const reference = newReference("CON");
  await db.insert(schema.consultations).values({
    reference,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    topic: input.topic,
    preferredWindow: input.preferredWindow,
    method: input.method ?? "any",
    message: input.message || null,
    status: "pending",
  });

  const settings = await getSettings();
  await sendSubmissionConfirmation({ to: input.email, name: input.name, reference, kindLabel: "consultation request" });
  await sendAdminNotification({
    notifyTo: adminNotifyAddress(settings.notifyEmail || undefined),
    subject: "New consultation request",
    lines: [
      `Reference: ${reference}`,
      `From: ${input.name} <${input.email}>`,
      `Topic: ${input.topic}`,
      `Preferred window: ${input.preferredWindow}`,
    ],
  });

  return jsonOk({ reference });
});

export const runtime = "nodejs";
