import { apiHandler, assertSameOrigin, jsonOk, parseJson, requireAdmin } from "@/lib/api";
import { categorySchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export const POST = apiHandler(async (req: Request) => {
  assertSameOrigin(req);
  const admin = await requireAdmin();
  const input = await parseJson(req, categorySchema);
  const slug = slugify(input.slug?.trim() || input.name);

  const db = await getDb();
  await db
    .insert(schema.articleCategories)
    .values({ name: input.name, slug })
    .onConflictDoNothing({ target: schema.articleCategories.slug });

  await recordAudit({ adminId: admin.id, action: "category.create", entity: "category", entityId: slug, ip: clientIp(req.headers) });
  return jsonOk();
});

export const runtime = "nodejs";
