import { apiHandler, checkRateLimit, formFiles, honeypotReject, jsonOk, HttpError } from "@/lib/api";
import { repairRequestSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { newReference, newAccessCode } from "@/lib/refs";
import { saveFile } from "@/lib/storage";
import { validateUpload, IMAGE_RULE } from "@/lib/uploads";
import { sendSubmissionConfirmation, sendAdminNotification, adminNotifyAddress } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { sha256 } from "@/lib/crypto";

/**
 * Repair requests. Multipart FormData:
 *  - field "data": JSON matching repairRequestSchema
 *  - field "photos": up to 4 images (validated by magic bytes, private storage)
 * Returns the repair reference AND a one-time access code used for secure
 * status lookups (reference numbers alone never reveal a record).
 */
export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:repair", 4, 600);

  const form = await req.formData();
  const raw = form.get("data");
  if (typeof raw !== "string") throw new HttpError("Invalid submission.", 400);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError("Invalid submission.", 400);
  }
  const input = repairRequestSchema.parse(parsed);
  if (honeypotReject(input.website)) return jsonOk({});

  const db = await getDb();
  const reference = newReference("REP");
  const accessCode = newAccessCode();

  const [inserted] = await db
    .insert(schema.repairRequests)
    .values({
      reference,
      accessCodeHash: sha256(accessCode),
      customerName: input.customerName,
      phone: input.phone,
      email: input.email || null,
      preferredContact: input.preferredContact ?? "phone",
      applianceCategory: input.applianceCategory,
      applianceType: input.applianceType,
      brand: input.brand || null,
      model: input.model || null,
      faultDescription: input.faultDescription,
      faultStarted: input.faultStarted || null,
      powersOn: input.powersOn || null,
      preferredDate: input.preferredDate || null,
      additionalInfo: input.additionalInfo || null,
      status: "new",
    })
    .returning({ id: schema.repairRequests.id });

  await db.insert(schema.repairStatusHistory).values({
    repairId: inserted.id,
    fromStatus: null,
    toStatus: "new",
    note: "Repair request submitted online.",
  });

  const photos = await formFiles(form, "photos", 4);
  let stored = 0;
  for (const photo of photos) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const check = validateUpload(photo.name, photo.type, buffer.length, buffer, IMAGE_RULE);
    if (!check.ok) continue;
    const ref = await saveFile(buffer, {
      prefix: `repairs/${inserted.id}`,
      originalName: photo.name,
      mimeType: check.mimeType!,
    });
    await db.insert(schema.repairFiles).values({
      repairId: inserted.id,
      storageKey: ref.key,
      originalName: photo.name.slice(0, 280),
      sizeBytes: buffer.length,
      mimeType: check.mimeType!,
    });
    stored++;
  }

  const settings = await getSettings();
  if (input.email) {
    await sendSubmissionConfirmation({
      to: input.email,
      name: input.customerName,
      reference: `${reference} (access code: ${accessCode})`,
      kindLabel: "repair request",
    });
  }
  await sendAdminNotification({
    notifyTo: adminNotifyAddress(settings.notifyEmail || undefined),
    subject: "New repair request",
    lines: [
      `Reference: ${reference}`,
      `Customer: ${input.customerName} · ${input.phone}`,
      `Appliance: ${input.applianceCategory} / ${input.applianceType}`,
      `Photos: ${stored}`,
    ],
  });

  return jsonOk({ reference, accessCode });
});

export const runtime = "nodejs";
