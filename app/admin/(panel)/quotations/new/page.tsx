import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader } from "@/components/admin/ui";
import { QuotationEditor } from "@/components/admin/QuotationEditor";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New quotation", robots: { index: false } };

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();

  let prefill = null;
  if (params.inquiry) {
    const db = await getDb();
    const rows = await db.select().from(schema.inquiries).where(eq(schema.inquiries.id, params.inquiry)).limit(1);
    if (rows[0]) {
      prefill = {
        id: rows[0].id,
        reference: rows[0].reference,
        name: rows[0].name,
        organisation: rows[0].organisation,
        email: rows[0].email,
        phone: rows[0].phone,
      };
    }
  }

  return (
    <>
      <PageHeader title="New quotation" description="Create a draft, refine it, then send it to the client." />
      <QuotationEditor mode="create" defaultTerms={settings.quoteTerms} prefillFromInquiry={prefill} />
    </>
  );
}
