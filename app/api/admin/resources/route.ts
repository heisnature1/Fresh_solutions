import { z } from "zod";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, requireAdmin, HttpError } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { saveFile, deleteFile } from "@/lib/storage";
import { validateUpload } from "@/lib/uploads";
import { eq } from "drizzle-orm";

const RESOURCE_RULE = {
  maxBytes: 15 * 1024 * 1024,
  allowed: {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
};

/** Upload a downloadable resource (PDF etc.) — published when publish=1. */
export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  if (!title || title.length > 300) throw new HttpError("Provide a resource title.", 422);

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new HttpError("Choose a file to upload.", 422);
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateUpload(file.name, file.type, buffer.length, buffer, RESOURCE_RULE);
  if (!check.ok) throw new HttpError(check.error ?? "Invalid file.", 422);

  const ref = await saveFile(buffer, { prefix: "resources", originalName: file.name, mimeType: check.mimeType!, public: true });
  const db = await getDb();
  await db.insert(schema.resources).values({
    title,
    description: description || null,
    storageKey: ref.key,
    originalName: file.name.slice(0, 280),
    sizeBytes: buffer.length,
    mimeType: check.mimeType!,
    isPublic: true,
    published: form.get("publish") === "1",
  });

  await recordAudit({ adminId: admin.id, action: "resource.upload", entity: "resource", entityId: title, ip: clientIp(req.headers) });
  return jsonOk();
});

const patchSchema = z.object({ id: z.string().uuid(), published: z.boolean() });

export const PATCH = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id, published } = z.object({ id: z.string().uuid(), published: z.boolean() }).parse(await req.json());
  const db = await getDb();
  await db.update(schema.resources).set({ published }).where(eq(schema.resources.id, id));
  await recordAudit({ adminId: admin.id, action: "resource.status", entity: "resource", entityId: id, meta: { published }, ip: clientIp(req.headers) });
  return jsonOk();
});

export const DELETE = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Missing id.", 400);
  const db = await getDb();
  const rows = await db.select().from(schema.resources).where(eq(schema.resources.id, id)).limit(1);
  if (rows[0]) {
    await deleteFile(rows[0].storageKey, true);
    await db.delete(schema.resources).where(eq(schema.resources.id, id));
  }
  await recordAudit({ adminId: admin.id, action: "resource.delete", entity: "resource", entityId: id, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
