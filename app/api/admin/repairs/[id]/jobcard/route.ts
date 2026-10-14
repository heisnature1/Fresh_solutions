import { asc, eq } from "drizzle-orm";
import { apiHandler, HttpError, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { buildJobCardPdf } from "@/lib/pdf/documents";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/constants";

/** Repair job card PDF — download or inline preview. Admin only. */
export const GET = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();

  const repairs = await db.select().from(schema.repairRequests).where(eq(schema.repairRequests.id, id)).limit(1);
  if (!repairs[0]) throw new HttpError("Repair not found.", 404);
  const parts = await db.select().from(schema.repairParts).where(eq(schema.repairParts.repairId, id)).orderBy(asc(schema.repairParts.createdAt));

  const settings = await getSettings();
  const pdf = await buildJobCardPdf(
    repairs[0],
    parts,
    { name: SITE_NAME, email: settings.contactEmail || undefined, phone: settings.contactPhone || undefined, location: settings.contactLocation || undefined },
    settings.jobCardFooter,
  );

  const inline = new URL(req.url).searchParams.get("preview") === "1";
  return new Response(Buffer.from(pdf) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="job-card-${repairs[0].reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
});

export const runtime = "nodejs";
