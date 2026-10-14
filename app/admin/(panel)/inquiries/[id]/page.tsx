import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, InfoCard, DetailRow, Table, THead, Th, Td, RowLink, EmptyRow } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { InquiryManager } from "@/components/admin/InquiryManager";
import { inquiryStatusLabel, SERVICES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiry", robots: { index: false } };

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const rows = await db.select().from(schema.inquiries).where(eq(schema.inquiries.id, id)).limit(1);
  if (!rows[0]) notFound();
  const inquiry = rows[0];

  const [notes, files, linkedQuotes, linkedProposals] = await Promise.all([
    db
      .select({ note: schema.inquiryNotes, adminName: schema.admins.name })
      .from(schema.inquiryNotes)
      .leftJoin(schema.admins, eq(schema.inquiryNotes.adminId, schema.admins.id))
      .where(eq(schema.inquiryNotes.inquiryId, id))
      .orderBy(desc(schema.inquiryNotes.createdAt)),
    db.select().from(schema.inquiryFiles).where(eq(schema.inquiryFiles.inquiryId, id)).orderBy(asc(schema.inquiryFiles.createdAt)),
    db.select({ id: schema.quotations.id, quoteNumber: schema.quotations.quoteNumber, status: schema.quotations.status, total: schema.quotations.total, currency: schema.quotations.currency }).from(schema.quotations).where(eq(schema.quotations.inquiryId, id)),
    db.select({ id: schema.proposals.id, proposalNumber: schema.proposals.proposalNumber, status: schema.proposals.status, title: schema.proposals.title }).from(schema.proposals).where(eq(schema.proposals.inquiryId, id)),
  ]);

  const serviceNames = (inquiry.services ?? []).map((s) => SERVICES.find((x) => x.slug === s)?.shortName ?? s);

  return (
    <>
      <PageHeader
        title={`Inquiry ${inquiry.reference}`}
        description={`Received ${formatDateTime(inquiry.createdAt)}`}
        actions={
          <>
            <Link href={`/admin/quotations/new?inquiry=${inquiry.id}`} className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
              Create quotation
            </Link>
            <Link href={`/admin/proposals/new?inquiry=${inquiry.id}`} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400">
              Create proposal
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <InfoCard title="Details">
            <dl className="divide-y divide-mist-100">
              <DetailRow label="Type" value={<span className="capitalize">{inquiry.kind.replace("_", " ")}</span>} />
              <DetailRow label="Status" value={<Badge tone={statusTone(inquiry.status)}>{inquiryStatusLabel(inquiry.status)}</Badge>} />
              <DetailRow label="Name" value={inquiry.name} />
              <DetailRow label="Organisation" value={inquiry.organisation} />
              <DetailRow label="Email" value={<a className="text-electric-700 underline-offset-2 hover:underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>} />
              <DetailRow label="Phone" value={inquiry.phone} />
              <DetailRow label="Preferred contact" value={<span className="capitalize">{inquiry.preferredContact ?? "email"}</span>} />
              {serviceNames.length > 0 ? <DetailRow label="Services" value={serviceNames.join(", ")} /> : null}
              <DetailRow label="Title / subject" value={inquiry.title} />
              {inquiry.message ? <DetailRow label="Message" value={<span className="whitespace-pre-wrap">{inquiry.message}</span>} /> : null}
              {inquiry.problem ? <DetailRow label="Problem to solve" value={<span className="whitespace-pre-wrap">{inquiry.problem}</span>} /> : null}
              {inquiry.description ? <DetailRow label="Description" value={<span className="whitespace-pre-wrap">{inquiry.description}</span>} /> : null}
              {inquiry.deliverables ? <DetailRow label="Deliverables" value={<span className="whitespace-pre-wrap">{inquiry.deliverables}</span>} /> : null}
              {inquiry.requirements ? <DetailRow label="Requirements" value={<span className="whitespace-pre-wrap">{inquiry.requirements}</span>} /> : null}
              {inquiry.budget ? <DetailRow label="Budget" value={inquiry.budget} /> : null}
              {inquiry.timeline ? <DetailRow label="Timeline" value={inquiry.timeline} /> : null}
              {inquiry.orgType ? <DetailRow label="Organisation type" value={inquiry.orgType} /> : null}
              {inquiry.consultMethod ? <DetailRow label="Consultation method" value={inquiry.consultMethod} /> : null}
            </dl>
          </InfoCard>

          <InfoCard title={`Attachments (${files.length})`}>
            {files.length === 0 ? (
              <p className="text-sm text-mist-500">No files attached.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-mist-200 px-4 py-2.5">
                    <span className="flex min-w-0 items-center gap-2.5 text-sm">
                      <Icon name="file-text" className="h-4 w-4 shrink-0 text-electric-600" />
                      <span className="truncate font-medium text-navy-900">{f.originalName}</span>
                      <span className="text-xs text-mist-400">{(f.sizeBytes / 1024).toFixed(0)} KB</span>
                    </span>
                    <a
                      href={`/api/admin/files/inquiry-file/${f.id}`}
                      className="shrink-0 rounded-lg bg-mist-100 px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:bg-electric-100 hover:text-electric-700"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>

          {(linkedQuotes.length > 0 || linkedProposals.length > 0) && (
            <InfoCard title="Linked documents">
              <Table minWidth={420}>
                <THead><Th>Document</Th><Th>Status</Th><Th>Total</Th></THead>
                <tbody>
                  {linkedQuotes.map((q) => (
                    <tr key={q.id}>
                      <Td><RowLink href={`/admin/quotations/${q.id}`}>Quotation {q.quoteNumber}</RowLink></Td>
                      <Td><Badge tone={statusTone(q.status)}>{q.status}</Badge></Td>
                      <Td>{q.currency} {q.total}</Td>
                    </tr>
                  ))}
                  {linkedProposals.map((p) => (
                    <tr key={p.id}>
                      <Td><RowLink href={`/admin/proposals/${p.id}`}>Proposal {p.proposalNumber}</RowLink></Td>
                      <Td><Badge tone={statusTone(p.status)}>{p.status}</Badge></Td>
                      <Td>—</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </InfoCard>
          )}
        </div>

        <div className="space-y-6">
          <InquiryManager inquiryId={inquiry.id} status={inquiry.status} />
          <InfoCard title={`Internal notes (${notes.length})`}>
            {notes.length === 0 ? (
              <p className="text-sm text-mist-500">No notes yet. Notes are never visible to customers.</p>
            ) : (
              <ol className="space-y-3">
                {notes.map((n) => (
                  <li key={n.note.id} className="rounded-xl bg-mist-50 p-3.5">
                    <p className="whitespace-pre-wrap text-sm text-navy-900">{n.note.note}</p>
                    <p className="mt-1.5 text-xs text-mist-500">
                      {n.adminName ?? "Administrator"} · {formatDateTime(n.note.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </InfoCard>
        </div>
      </div>
    </>
  );
}
