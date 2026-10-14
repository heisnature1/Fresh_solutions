import { eq } from "drizzle-orm";
import { apiHandler, checkRateLimit, formFiles, honeypotReject, jsonOk, HttpError } from "@/lib/api";
import { applicationSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { newReference } from "@/lib/refs";
import { saveFile } from "@/lib/storage";
import { validateUpload, CV_RULE } from "@/lib/uploads";
import { sendAdminNotification, adminNotifyAddress, sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

/**
 * Job applications. CV is mandatory, validated by content, stored privately.
 * Applicant documents are never exposed publicly.
 */
export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:application", 4, 600);

  const form = await req.formData();
  const raw = form.get("data");
  if (typeof raw !== "string") throw new HttpError("Invalid submission.", 400);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError("Invalid submission.", 400);
  }
  const input = applicationSchema.parse(parsed);
  if (honeypotReject(input.website)) return jsonOk({});

  const db = await getDb();
  const vacancy = await db
    .select()
    .from(schema.vacancies)
    .where(eq(schema.vacancies.id, input.vacancyId))
    .limit(1);
  if (!vacancy[0] || vacancy[0].status !== "published") {
    throw new HttpError("This vacancy is no longer accepting applications.", 422);
  }
  if (vacancy[0].deadline && vacancy[0].deadline < new Date().toISOString().slice(0, 10)) {
    throw new HttpError("The application deadline for this vacancy has passed.", 422);
  }

  const cvs = await formFiles(form, "cv", 1);
  if (cvs.length === 0) {
    throw new HttpError("Please attach your CV.", 422, );
  }
  const cv = cvs[0];
  const cvBuffer = Buffer.from(await cv.arrayBuffer());
  const cvCheck = validateUpload(cv.name, cv.type, cvBuffer.length, cvBuffer, CV_RULE);
  if (!cvCheck.ok) throw new HttpError(cvCheck.error ?? "Invalid CV file.", 422);

  const reference = newReference("APP");
  const ref = await saveFile(cvBuffer, {
    prefix: `applications`,
    originalName: cv.name,
    mimeType: cvCheck.mimeType!,
  });

  await db.insert(schema.applications).values({
    reference,
    vacancyId: vacancy[0].id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    statement: input.statement || null,
    cvStorageKey: ref.key,
    cvOriginalName: cv.name.slice(0, 280),
    status: "received",
  });

  const settings = await getSettings();
  await sendEmail({
    to: input.email,
    subject: `Application received — ${vacancy[0].title} (${reference})`,
    text: `Hello ${input.name},\n\nThank you for applying for the role of "${vacancy[0].title}" at Fresh Solutions. Your application has been received with reference ${reference}.\n\nWe review every application carefully and will contact you at this email address or on ${input.phone} if you are shortlisted.\n\n— Fresh Solutions`,
    template: "application_confirmation",
  });
  await sendAdminNotification({
    notifyTo: adminNotifyAddress(settings.notifyEmail || undefined),
    subject: "New job application",
    lines: [
      `Reference: ${reference}`,
      `Role: ${vacancy[0].title}`,
      `Applicant: ${input.name} <${input.email}>`,
    ],
  });

  return jsonOk({ reference });
});

export const runtime = "nodejs";
