import { eq } from "drizzle-orm";
import { apiHandler, HttpError, requireAdmin } from "@/lib/api";
import { getDb, schema } from "@/lib/db/client";
import { buildProposalPdf } from "@/lib/pdf/documents";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/constants";

export const GET = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  const rows = await db.select().from(schema.proposals).where(eq(schema.proposals.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Proposal not found.", 404);

  const settings = await getSettings();
  const pdf = await buildProposalPdf(rows[0], {
    name: SITE_NAME,
    email: settings.contactEmail || undefined,
    phone: settings.contactPhone || undefined,
    location: settings.contactLocation || undefined,
  });

  const inline = new URL(req.url).searchParams.get("preview") === "1";
  return new Response(Buffer.from(pdf) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="proposal-${rows[0].proposalNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
});

export const runtime = "nodejs";
