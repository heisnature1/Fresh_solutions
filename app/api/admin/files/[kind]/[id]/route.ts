import { eq } from "drizzle-orm";
import { apiHandler, HttpError, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { privateDownloadUrl } from "@/lib/storage";

/**
 * Generic short-lived download links for admin-owned private files
 * (inquiry attachments, repair photos). Whitelisted table kinds only.
 */
const KINDS = {
  "inquiry-file": { table: schema.inquiryFiles, key: "storageKey", name: "originalName" },
  "repair-file": { table: schema.repairFiles, key: "storageKey", name: "originalName" },
} as const;

export const GET = apiHandler(async (req: Request, ctx: { params: Promise<{ kind: string; id: string }> }) => {
  await requireAdmin();
  const { kind, id } = await ctx.params;
  const config = KINDS[kind as keyof typeof KINDS];
  if (!config) throw new HttpError("Not found.", 404);

  const db = await getDb();
  const rows = await db.select().from(config.table).where(eq(config.table.id, id)).limit(1);
  const row = rows[0] as unknown as Record<string, unknown> | undefined;
  if (!row) throw new HttpError("File not found.", 404);

  const url = await privateDownloadUrl(String(row[config.key]), 1800);
  if (!url) throw new HttpError("Storage is not available.", 503);

  const separator = url.includes("?") ? "&" : "?";
  return Response.redirect(`${url}${separator}n=${encodeURIComponent(String(row[config.name]))}`, 302);
});

export const runtime = "nodejs";
