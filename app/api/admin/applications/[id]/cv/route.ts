import { eq } from "drizzle-orm";
import { apiHandler, HttpError, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { privateDownloadUrl } from "@/lib/storage";

/** Issues a short-lived download link for an applicant's CV. Admin only. */
export const GET = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  const rows = await db.select().from(schema.applications).where(eq(schema.applications.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Application not found.", 404);

  const url = await privateDownloadUrl(rows[0].cvStorageKey, 1800);
  if (!url) throw new HttpError("Storage is not available.", 503);

  const separator = url.includes("?") ? "&" : "?";
  return Response.redirect(`${url}${separator}n=${encodeURIComponent(rows[0].cvOriginalName)}`, 302);
});

export const runtime = "nodejs";
