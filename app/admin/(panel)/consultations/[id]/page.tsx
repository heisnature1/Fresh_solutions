import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, InfoCard, DetailRow } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { ConsultationManager } from "@/components/admin/ConsultationManager";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consultation", robots: { index: false } };

export default async function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const rows = await db.select().from(schema.consultations).where(eq(schema.consultations.id, id)).limit(1);
  if (!rows[0]) notFound();
  const c = rows[0];

  return (
    <>
      <PageHeader
        title={`Consultation ${c.reference}`}
        description={`Received ${formatDateTime(c.createdAt)}`}
        actions={<Badge tone={statusTone(c.status)} className="px-3 py-1.5 text-sm capitalize">{c.status}</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <InfoCard title="Request details">
          <dl className="divide-y divide-mist-100">
            <DetailRow label="Name" value={c.name} />
            <DetailRow label="Email" value={<a className="text-electric-700 underline-offset-2 hover:underline" href={`mailto:${c.email}`}>{c.email}</a>} />
            <DetailRow label="Phone" value={c.phone} />
            <DetailRow label="Topic" value={c.topic} />
            <DetailRow label="Preferred window" value={c.preferredWindow} />
            <DetailRow label="Preferred method" value={<span className="capitalize">{c.method ?? "any"}</span>} />
            <DetailRow label="Message" value={c.message} />
            {c.confirmedAt ? <DetailRow label="Confirmed for" value={formatDateTime(c.confirmedAt)} /> : null}
            {c.adminNotes ? <DetailRow label="Internal notes" value={<span className="whitespace-pre-wrap">{c.adminNotes}</span>} /> : null}
          </dl>
        </InfoCard>
        <ConsultationManager
          consultation={{
            id: c.id,
            status: c.status,
            confirmedDate: c.confirmedAt ? c.confirmedAt.toISOString().slice(0, 10) : "",
            confirmedTime: c.confirmedAt ? c.confirmedAt.toISOString().slice(11, 16) : "09:00",
            adminNotes: c.adminNotes ?? "",
          }}
        />
      </div>
    </>
  );
}
