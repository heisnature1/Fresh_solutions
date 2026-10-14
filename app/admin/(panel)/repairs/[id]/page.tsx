import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader, InfoCard, DetailRow } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { statusTone } from "@/components/ui";
import { RepairManager } from "@/components/admin/RepairManager";
import { repairStatusLabel, applianceCategoryLabel } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Repair job", robots: { index: false } };

export default async function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const rows = await db.select().from(schema.repairRequests).where(eq(schema.repairRequests.id, id)).limit(1);
  if (!rows[0]) notFound();
  const repair = rows[0];

  const [history, notes, parts, photos] = await Promise.all([
    db.select({ h: schema.repairStatusHistory, adminName: schema.admins.name })
      .from(schema.repairStatusHistory)
      .leftJoin(schema.admins, eq(schema.repairStatusHistory.changedBy, schema.admins.id))
      .where(eq(schema.repairStatusHistory.repairId, id))
      .orderBy(desc(schema.repairStatusHistory.createdAt)),
    db.select({ n: schema.repairNotes, adminName: schema.admins.name })
      .from(schema.repairNotes)
      .leftJoin(schema.admins, eq(schema.repairNotes.adminId, schema.admins.id))
      .where(eq(schema.repairNotes.repairId, id))
      .orderBy(desc(schema.repairNotes.createdAt)),
    db.select().from(schema.repairParts).where(eq(schema.repairParts.repairId, id)).orderBy(asc(schema.repairParts.createdAt)),
    db.select().from(schema.repairFiles).where(eq(schema.repairFiles.repairId, id)).orderBy(asc(schema.repairFiles.createdAt)),
  ]);

  // Customer's previous repairs (linked by phone number — the required contact field)
  const customerHistory = await db
    .select({
      id: schema.repairRequests.id,
      reference: schema.repairRequests.reference,
      applianceType: schema.repairRequests.applianceType,
      status: schema.repairRequests.status,
      createdAt: schema.repairRequests.createdAt,
    })
    .from(schema.repairRequests)
    .where(eq(schema.repairRequests.phone, repair.phone))
    .orderBy(desc(schema.repairRequests.createdAt))
    .limit(20);

  return (
    <>
      <PageHeader
        title={`Repair ${repair.reference}`}
        description={`${repair.applianceType} · received ${formatDateTime(repair.createdAt)}`}
        actions={
          <>
            <a
              href={`/api/admin/repairs/${repair.id}/jobcard?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400"
            >
              Preview job card
            </a>
            <a
              href={`/api/admin/repairs/${repair.id}/jobcard`}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
            >
              <Icon name="printer" className="h-4 w-4" /> Download job card PDF
            </a>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <InfoCard title="Customer & appliance">
            <dl className="divide-y divide-mist-100">
              <DetailRow label="Customer" value={repair.customerName} />
              <DetailRow label="Phone" value={<a className="text-electric-700 underline-offset-2 hover:underline" href={`tel:${repair.phone.replace(/[^\d+]/g, "")}`}>{repair.phone}</a>} />
              <DetailRow label="Email" value={repair.email ? <a className="text-electric-700 underline-offset-2 hover:underline" href={`mailto:${repair.email}`}>{repair.email}</a> : "—"} />
              <DetailRow label="Preferred contact" value={<span className="capitalize">{repair.preferredContact ?? "phone"}</span>} />
              <DetailRow label="Category" value={applianceCategoryLabel(repair.applianceCategory)} />
              <DetailRow label="Appliance" value={repair.applianceType} />
              <DetailRow label="Brand / model" value={[repair.brand, repair.model].filter(Boolean).join(" ") || "—"} />
              <DetailRow label="Powers on" value={<span className="capitalize">{repair.powersOn ?? "unknown"}</span>} />
              <DetailRow label="Fault started" value={repair.faultStarted} />
              <DetailRow label="Preferred date" value={repair.preferredDate} />
              <DetailRow label="Reported fault" value={<span className="whitespace-pre-wrap">{repair.faultDescription}</span>} />
              {repair.additionalInfo ? <DetailRow label="Additional info" value={<span className="whitespace-pre-wrap">{repair.additionalInfo}</span>} /> : null}
            </dl>
            {photos.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-500">Customer photos ({photos.length})</p>
                <div className="flex flex-wrap gap-2">
                  {photos.map((p) => (
                    <a
                      key={p.id}
                      href={`/api/admin/files/repair-file/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-mist-100 px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:bg-electric-100 hover:text-electric-700"
                    >
                      {p.originalName}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </InfoCard>

          <RepairManager
            repair={{
              id: repair.id,
              status: repair.status,
              technician: repair.technician ?? "",
              diagnosis: repair.diagnosis ?? "",
              estimatedCost: repair.estimatedCost ?? "",
              estimateApproved: repair.estimateApproved,
              workPerformed: repair.workPerformed ?? "",
              testingResults: repair.testingResults ?? "",
              warrantyTerms: repair.warrantyTerms ?? "",
            }}
            parts={parts.map((p) => ({ id: p.id, name: p.name, quantity: p.quantity, unitCost: p.unitCost, status: p.status }))}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <InfoCard title={`Status history (${history.length})`}>
              {history.length === 0 ? (
                <p className="text-sm text-mist-500">No status changes recorded yet.</p>
              ) : (
                <ol className="space-y-0 border-l-2 border-mist-200 pl-5">
                  {history.map((h) => (
                    <li key={h.h.id} className="relative pb-4 last:pb-0">
                      <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-electric-500" aria-hidden />
                      <p className="text-sm">
                        <Badge tone={statusTone(h.h.toStatus)}>{repairStatusLabel(h.h.toStatus)}</Badge>
                      </p>
                      {h.h.note ? <p className="mt-1 text-xs text-mist-600">{h.h.note}</p> : null}
                      <p className="mt-0.5 text-xs text-mist-400">
                        {formatDateTime(h.h.createdAt)}{h.adminName ? ` · ${h.adminName}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </InfoCard>

            <InfoCard title={`Technician notes (${notes.length})`}>
              {notes.length === 0 ? (
                <p className="text-sm text-mist-500">No notes yet. Notes stay internal — customers never see them.</p>
              ) : (
                <ol className="space-y-3">
                  {notes.map((n) => (
                    <li key={n.n.id} className="rounded-xl bg-mist-50 p-3.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">{n.n.kind.replace("_", " ")}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-navy-900">{n.n.note}</p>
                      <p className="mt-1.5 text-xs text-mist-500">{n.adminName ?? "Administrator"} · {formatDateTime(n.n.createdAt)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </InfoCard>
          </div>
        </div>

        <div className="space-y-6">
          <InfoCard title="Job summary">
            <dl className="divide-y divide-mist-100">
              <DetailRow label="Status" value={<Badge tone={statusTone(repair.status)}>{repairStatusLabel(repair.status)}</Badge>} />
              <DetailRow label="Technician" value={repair.technician} />
              <DetailRow label="Estimate approved" value={repair.estimateApproved === true ? "Yes" : repair.estimateApproved === false ? "Declined" : "Pending"} />
              <DetailRow label="Completed" value={repair.completedAt ? formatDateTime(repair.completedAt) : "—"} />
            </dl>
          </InfoCard>

          <InfoCard title={`Repair history for ${repair.customerName}`}>
            {customerHistory.length <= 1 ? (
              <p className="text-sm text-mist-500">This is the customer's first recorded repair with us.</p>
            ) : (
              <ul className="space-y-2">
                {customerHistory.map((h) => (
                  <li key={h.id}>
                    <a href={`/admin/repairs/${h.id}`} className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${h.id === repair.id ? "border-electric-300 bg-electric-50" : "border-mist-200 hover:border-electric-300"}`}>
                      <span>
                        <span className="block font-mono text-xs text-mist-500">{h.reference}</span>
                        <span className="font-medium text-navy-900">{h.applianceType}</span>
                      </span>
                      <span className="text-right">
                        <Badge tone={statusTone(h.status)}>{repairStatusLabel(h.status)}</Badge>
                        <span className="block text-xs text-mist-400">{formatDateTime(h.createdAt)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-mist-400">Linked by the customer's telephone number.</p>
          </InfoCard>
        </div>
      </div>
    </>
  );
}
