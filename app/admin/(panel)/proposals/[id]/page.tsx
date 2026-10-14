import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, InfoCard, DetailRow } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { ProposalEditor } from "@/components/admin/ProposalEditor";
import { DOCUMENT_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proposal", robots: { index: false } };

const DISPLAY_SECTIONS: Array<{ key: string; label: string }> = [
  { key: "executiveSummary", label: "Executive summary" },
  { key: "requirements", label: "Client requirements" },
  { key: "solution", label: "Proposed solution" },
  { key: "scopeOfWork", label: "Scope of work" },
  { key: "deliverables", label: "Deliverables" },
  { key: "milestones", label: "Project milestones" },
  { key: "timeline", label: "Estimated timeline" },
  { key: "pricing", label: "Pricing" },
  { key: "assumptions", label: "Assumptions" },
  { key: "exclusions", label: "Exclusions" },
  { key: "terms", label: "Terms & conditions" },
];

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const settings = await getSettings();

  const rows = await db.select().from(schema.proposals).where(eq(schema.proposals.id, id)).limit(1);
  if (!rows[0]) notFound();
  const proposal = rows[0];

  let inquiry = null;
  if (proposal.inquiryId) {
    const inq = await db.select().from(schema.inquiries).where(eq(schema.inquiries.id, proposal.inquiryId)).limit(1);
    inquiry = inq[0] ?? null;
  }

  const statusLabel = DOCUMENT_STATUSES.find((s) => s.value === proposal.status)?.label ?? proposal.status;

  return (
    <>
      <PageHeader
        title={`Proposal ${proposal.proposalNumber}`}
        description={`${proposal.title} · created ${formatDateTime(proposal.createdAt)}`}
        actions={<Badge tone={statusTone(proposal.status)} className="px-3 py-1.5 text-sm">{statusLabel}</Badge>}
      />

      {proposal.status === "draft" ? (
        <ProposalEditor
          mode="edit"
          proposalId={proposal.id}
          defaultCurrency={settings.defaultCurrency}
          initial={{
            inquiryId: proposal.inquiryId ?? "",
            clientName: proposal.clientName,
            clientOrganisation: proposal.clientOrganisation ?? "",
            clientEmail: proposal.clientEmail ?? "",
            title: proposal.title,
            executiveSummary: proposal.executiveSummary ?? "",
            requirements: proposal.requirements ?? "",
            solution: proposal.solution ?? "",
            scopeOfWork: proposal.scopeOfWork ?? "",
            deliverables: proposal.deliverables ?? "",
            milestones: proposal.milestones ?? "",
            timeline: proposal.timeline ?? "",
            pricing: proposal.pricing ?? "",
            assumptions: proposal.assumptions ?? "",
            exclusions: proposal.exclusions ?? "",
            terms: proposal.terms ?? "",
            validityDays: String(proposal.validityDays ?? 30),
          }}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <InfoCard title="Client">
              <dl className="divide-y divide-mist-100">
                <DetailRow label="Client" value={`${proposal.clientName}${proposal.clientOrganisation ? ` — ${proposal.clientOrganisation}` : ""}`} />
                <DetailRow label="Email" value={proposal.clientEmail} />
                <DetailRow label="Validity" value={`${proposal.validityDays ?? 30} days from issue`} />
                {inquiry ? (
                  <DetailRow label="Linked inquiry" value={<Link href={`/admin/inquiries/${inquiry.id}`} className="text-electric-700 underline underline-offset-2">{inquiry.reference}</Link>} />
                ) : null}
              </dl>
            </InfoCard>
            {DISPLAY_SECTIONS.map((s) => {
              const value = (proposal as unknown as Record<string, string | null>)[s.key];
              if (!value) return null;
              return (
                <InfoCard key={s.key} title={s.label}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-700">{value}</p>
                </InfoCard>
              );
            })}
          </div>
          <DocumentActions kind="proposals" id={proposal.id} status={proposal.status} />
        </div>
      )}
    </>
  );
}
