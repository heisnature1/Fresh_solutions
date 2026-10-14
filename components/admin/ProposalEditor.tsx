"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner } from "./client-utils";
import { Button, Input, Label, Textarea } from "@/components/ui";

export interface ProposalFormData {
  inquiryId?: string;
  clientName: string;
  clientOrganisation: string;
  clientEmail: string;
  title: string;
  executiveSummary: string;
  requirements: string;
  solution: string;
  scopeOfWork: string;
  deliverables: string;
  milestones: string;
  timeline: string;
  pricing: string;
  assumptions: string;
  exclusions: string;
  terms: string;
  validityDays: string;
}

const SECTIONS: Array<{ key: keyof ProposalFormData; label: string; rows: number }> = [
  { key: "executiveSummary", label: "Executive summary", rows: 3 },
  { key: "requirements", label: "Client requirements", rows: 4 },
  { key: "solution", label: "Proposed solution", rows: 5 },
  { key: "scopeOfWork", label: "Scope of work", rows: 4 },
  { key: "deliverables", label: "Deliverables", rows: 4 },
  { key: "milestones", label: "Project milestones", rows: 4 },
  { key: "timeline", label: "Estimated timeline", rows: 3 },
  { key: "pricing", label: "Pricing", rows: 4 },
  { key: "assumptions", label: "Assumptions", rows: 3 },
  { key: "exclusions", label: "Exclusions", rows: 3 },
  { key: "terms", label: "Terms & conditions", rows: 3 },
];

export function ProposalEditor({
  mode,
  proposalId,
  initial,
  defaultCurrency,
  prefillFromInquiry,
}: {
  mode: "create" | "edit";
  proposalId?: string;
  initial?: Partial<ProposalFormData>;
  defaultCurrency: string;
  prefillFromInquiry?: { id: string; reference: string; name: string; organisation: string | null; email: string; title: string | null } | null;
}) {
  const router = useRouter();
  const { busy, error, run } = useBusy();
  const [f, setF] = useState<ProposalFormData>({
    inquiryId: initial?.inquiryId ?? prefillFromInquiry?.id ?? "",
    clientName: initial?.clientName ?? prefillFromInquiry?.name ?? "",
    clientOrganisation: initial?.clientOrganisation ?? prefillFromInquiry?.organisation ?? "",
    clientEmail: initial?.clientEmail ?? prefillFromInquiry?.email ?? "",
    title: initial?.title ?? (prefillFromInquiry?.title ? `Proposal: ${prefillFromInquiry.title}` : ""),
    executiveSummary: initial?.executiveSummary ?? "",
    requirements: initial?.requirements ?? "",
    solution: initial?.solution ?? "",
    scopeOfWork: initial?.scopeOfWork ?? "",
    deliverables: initial?.deliverables ?? "",
    milestones: initial?.milestones ?? "",
    timeline: initial?.timeline ?? "",
    pricing: initial?.pricing ?? "",
    assumptions: initial?.assumptions ?? "",
    exclusions: initial?.exclusions ?? "",
    terms: initial?.terms ?? "",
    validityDays: initial?.validityDays ?? "30",
  });

  const set = (k: keyof ProposalFormData, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  async function save() {
    const payload = {
      inquiryId: f.inquiryId || undefined,
      clientName: f.clientName,
      clientOrganisation: f.clientOrganisation || undefined,
      clientEmail: f.clientEmail || undefined,
      title: f.title,
      executiveSummary: f.executiveSummary || undefined,
      requirements: f.requirements || undefined,
      solution: f.solution || undefined,
      scopeOfWork: f.scopeOfWork || undefined,
      deliverables: f.deliverables || undefined,
      milestones: f.milestones || undefined,
      timeline: f.timeline || undefined,
      pricing: f.pricing || undefined,
      assumptions: f.assumptions || undefined,
      exclusions: f.exclusions || undefined,
      terms: f.terms || undefined,
      validityDays: Number(f.validityDays) || 30,
      currency: defaultCurrency,
    };
    await run(
      () =>
        mode === "create"
          ? apiCall("/api/admin/proposals", "POST", payload)
          : apiCall(`/api/admin/proposals/${proposalId}`, "PATCH", payload),
      {
        onSuccess: (data) => {
          router.push(`/admin/proposals/${mode === "create" ? data?.id : proposalId}`);
          router.refresh();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {prefillFromInquiry && !initial?.clientName ? (
        <p className="rounded-xl border border-electric-200 bg-electric-50 px-4 py-3 text-sm text-navy-900">
          Client details pre-filled from inquiry <strong className="font-mono">{prefillFromInquiry.reference}</strong>.
        </p>
      ) : null}

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Client & title</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="p-name" required>Client name</Label><Input id="p-name" value={f.clientName} onChange={(e) => set("clientName", e.target.value)} maxLength={200} /></div>
          <div><Label htmlFor="p-org">Organisation</Label><Input id="p-org" value={f.clientOrganisation} onChange={(e) => set("clientOrganisation", e.target.value)} maxLength={200} /></div>
          <div><Label htmlFor="p-email">Email</Label><Input id="p-email" type="email" value={f.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} maxLength={320} /></div>
          <div><Label htmlFor="p-validity">Validity (days)</Label><Input id="p-validity" type="number" min="1" max="365" value={f.validityDays} onChange={(e) => set("validityDays", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label htmlFor="p-title" required>Proposal title</Label><Input id="p-title" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={300} /></div>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-1 font-display text-base font-bold text-navy-900">Proposal sections</h2>
        <p className="mb-4 text-sm text-mist-500">Leave a section empty to omit it from the generated PDF.</p>
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <Label htmlFor={`p-${s.key}`}>{s.label}</Label>
              <Textarea id={`p-${s.key}`} value={f[s.key]} onChange={(e) => set(s.key, e.target.value)} rows={s.rows} maxLength={8000} />
            </div>
          ))}
        </div>
      </div>

      <ErrorBanner message={error} />
      <div className="flex gap-3">
        <Button onClick={save} disabled={busy || !f.clientName.trim() || !f.title.trim()} size="lg">
          {busy ? "Saving…" : mode === "create" ? "Create draft proposal" : "Save draft"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
