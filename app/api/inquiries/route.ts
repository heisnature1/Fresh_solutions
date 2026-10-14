import { apiHandler, checkRateLimit, formFiles, honeypotReject, jsonOk, HttpError } from "@/lib/api";
import { inquirySchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { newReference } from "@/lib/refs";
import { saveFile } from "@/lib/storage";
import { validateUpload, DOCUMENT_RULE } from "@/lib/uploads";
import { sendSubmissionConfirmation, sendAdminNotification, adminNotifyAddress } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { SERVICES } from "@/lib/constants";

/**
 * Project / quotation inquiries. Accepts multipart FormData:
 *  - field "data": JSON matching inquirySchema
 *  - field "files": up to 5 optional attachments (validated server-side,
 *    stored privately outside any public path)
 */
export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:inquiry", 5, 600);

  const form = await req.formData();
  const raw = form.get("data");
  if (typeof raw !== "string") throw new HttpError("Invalid submission.", 400);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError("Invalid submission.", 400);
  }
  const input = inquirySchema.parse(parsed);
  if (honeypotReject(input.website)) return jsonOk({});

  // Only real service slugs are stored.
  const services = input.services.filter((s) => SERVICES.some((svc) => svc.slug === s));
  if (services.length === 0) throw new HttpError("Select at least one valid service.", 422);

  const db = await getDb();
  const reference = newReference(input.kind === "quotation" ? "QTN" : "INQ");

  const [inserted] = await db
    .insert(schema.inquiries)
    .values({
      reference,
      kind: input.kind,
      name: input.name,
      organisation: input.organisation || null,
      email: input.email,
      phone: input.phone || null,
      preferredContact: input.preferredContact ?? "email",
      services,
      title: input.title,
      problem: input.problem || null,
      description: input.description || null,
      deliverables: input.deliverables || null,
      requirements: input.requirements || null,
      budget: input.budget || null,
      timeline: input.timeline || null,
      orgType: input.orgType || null,
      consultMethod: input.consultMethod || null,
      status: "new",
    })
    .returning({ id: schema.inquiries.id });

  // Attachments (validated, renamed, private)
  const files = await formFiles(form, "files", 5);
  let stored = 0;
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const check = validateUpload(file.name, file.type, buffer.length, buffer, DOCUMENT_RULE);
    if (!check.ok) continue; // skip invalid files rather than failing the whole inquiry
    const ref = await saveFile(buffer, {
      prefix: `inquiries/${inserted.id}`,
      originalName: file.name,
      mimeType: check.mimeType!,
    });
    await db.insert(schema.inquiryFiles).values({
      inquiryId: inserted.id,
      storageKey: ref.key,
      originalName: file.name.slice(0, 280),
      sizeBytes: buffer.length,
      mimeType: check.mimeType!,
    });
    stored++;
  }

  const settings = await getSettings();
  const kindLabel = input.kind === "quotation" ? "quotation request" : "project inquiry";
  await sendSubmissionConfirmation({ to: input.email, name: input.name, reference, kindLabel });
  await sendAdminNotification({
    notifyTo: adminNotifyAddress(settings.notifyEmail || undefined),
    subject: `New ${kindLabel}`,
    lines: [
      `Reference: ${reference}`,
      `From: ${input.name} <${input.email}>`,
      `Services: ${services.join(", ")}`,
      `Title: ${input.title}`,
      `Attachments: ${stored}`,
    ],
  });

  return jsonOk({ reference });
});

export const runtime = "nodejs";
