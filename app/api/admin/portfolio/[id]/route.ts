import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { apiHandler, assertSameOrigin, jsonError, jsonOk, parseJson, requireAdmin, formFiles, HttpError } from "@/lib/api";
import { portfolioSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { saveFile, deleteFile } from "@/lib/storage";
import { validateUpload, IMAGE_RULE } from "@/lib/uploads";

const statusSchema = z.object({ status: z.enum(["draft", "published", "archived"]) });

export const PATCH = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;

  const db = await getDb();
  const existing = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.id, id)).limit(1);
  if (!existing[0]) return jsonError("Project not found.", 404);

  // Status-only updates come as { status } JSON.
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null) as { status?: string };
    const parsed = statusSchema.safeParse(body);
    if (parsed.success) {
      await db
        .update(schema.portfolioProjects)
        .set({
          status: parsed.data.status,
          publishedAt: parsed.data.status === "published" ? (existing[0].publishedAt ?? new Date()) : existing[0].publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.portfolioProjects.id, id));
      await recordAudit({ adminId: admin.id, action: "portfolio.status", entity: "project", entityId: existing[0].slug, meta: { status: parsed.data.status }, ip: clientIp(req.headers) });
      return jsonOk();
    }
    return jsonError("Invalid status.", 422);
  }

  // Full edit comes as FormData (fields + optional images).
  const form = await req.formData();
  const raw = form.get("data");
  if (typeof raw !== "string") throw new HttpError("Invalid submission.", 400);
  const input = portfolioSchema.parse(JSON.parse(raw));

  const slugBase = slugify(input.slug?.trim() || input.title);
  let slug = existing[0].slug;
  if (slugBase && slugBase !== existing[0].slug) {
    const taken = await db.select({ id: schema.portfolioProjects.id }).from(schema.portfolioProjects).where(eq(schema.portfolioProjects.slug, slugBase)).limit(1);
    if (!taken[0]) slug = slugBase;
  }

  // Publish guard: a project needs meaningful content before going live.
  if ((existing[0].status !== "published") && form.get("publish") === "1") {
    if (!input.summary?.trim() || !input.description?.trim()) {
      return jsonError("Add at least a summary and description before publishing.", 422);
    }
  }

  const nextStatus = form.get("publish") === "1" ? "published" : form.get("unpublish") === "1" ? "draft" : existing[0].status;

  await db
    .update(schema.portfolioProjects)
    .set({
      slug,
      title: input.title,
      summary: input.summary || null,
      description: input.description || null,
      problem: input.problem || null,
      solution: input.solution || null,
      technologies: input.technologies ?? [],
      deliverables: input.deliverables || null,
      results: input.results || null,
      category: input.category || null,
      industry: input.industry || null,
      liveUrl: input.liveUrl || null,
      externalUrl: input.externalUrl || null,
      featured: input.featured ?? false,
      status: nextStatus,
      publishedAt: nextStatus === "published" ? (existing[0].publishedAt ?? new Date()) : existing[0].publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.portfolioProjects.id, id));

  // New images (public bucket, validated, magic-byte checked)
  const images = await formFiles(form, "images", 8);
  let uploaded = 0;
  for (const image of images) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const check = validateUpload(image.name, image.type, buffer.length, buffer, IMAGE_RULE);
    if (!check.ok) continue;
    const ref = await saveFile(buffer, { prefix: `portfolio/${id}`, originalName: image.name, mimeType: check.mimeType!, public: true });
    await db.insert(schema.projectImages).values({ projectId: id, storageKey: ref.key, alt: String(form.get(`alt_${uploaded}`) ?? "").slice(0, 280) || input.title });
    uploaded++;
  }

  await recordAudit({ adminId: admin.id, action: "portfolio.update", entity: "project", entityId: slug, meta: { imagesAdded: uploaded, status: nextStatus }, ip: clientIp(req.headers) });
  return jsonOk({ slug });
});

export const DELETE = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const imageId = new URL(req.url).searchParams.get("imageId");
  if (!imageId) return jsonError("Missing imageId.", 400);

  const db = await getDb();
  const rows = await db.select().from(schema.projectImages).where(eq(schema.projectImages.id, imageId)).limit(1);
  if (rows[0] && rows[0].projectId === id) {
    await deleteFile(rows[0].storageKey, true);
    await db.delete(schema.projectImages).where(eq(schema.projectImages.id, imageId));
  }
  await recordAudit({ adminId: admin.id, action: "portfolio.image.remove", entity: "project", entityId: id, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
