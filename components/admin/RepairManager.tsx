"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { REPAIR_STATUSES } from "@/lib/constants";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

interface RepairData {
  id: string;
  status: string;
  technician: string;
  diagnosis: string;
  estimatedCost: string;
  estimateApproved: boolean | null;
  workPerformed: string;
  testingResults: string;
  warrantyTerms: string;
}

interface Part {
  id: string;
  name: string;
  quantity: string;
  unitCost: string | null;
  status: string;
}

export function RepairManager({ repair, parts }: { repair: RepairData; parts: Part[] }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [form, setForm] = useState({ ...repair });
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState("");
  const [noteKind, setNoteKind] = useState("note");
  const [newPart, setNewPart] = useState({ name: "", quantity: "1", unitCost: "", status: "needed" });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function saveAll() {
    await run(
      () =>
        apiCall(`/api/admin/repairs/${repair.id}`, "PATCH", {
          status: form.status,
          technician: form.technician || undefined,
          diagnosis: form.diagnosis,
          estimatedCost: form.estimatedCost === "" ? "" : form.estimatedCost,
          estimateApproved: form.estimateApproved,
          workPerformed: form.workPerformed,
          testingResults: form.testingResults,
          warrantyTerms: form.warrantyTerms,
          statusNote: statusNote.trim() || undefined,
          note: note.trim() || undefined,
          noteKind,
        }),
      {
        notice: "Repair updated.",
        onSuccess: () => { setStatusNote(""); setNote(""); router.refresh(); },
      },
    );
  }

  async function addPart() {
    if (!newPart.name.trim()) return;
    await run(
      () =>
        apiCall(`/api/admin/repairs/${repair.id}/parts`, "POST", {
          name: newPart.name,
          quantity: Number(newPart.quantity) || 1,
          unitCost: newPart.unitCost === "" ? "" : Number(newPart.unitCost),
          status: newPart.status,
        }),
      { notice: "Part added.", onSuccess: () => { setNewPart({ name: "", quantity: "1", unitCost: "", status: "needed" }); router.refresh(); } },
    );
  }

  async function removePart(partId: string) {
    await run(() => apiCall(`/api/admin/repairs/${repair.id}/parts?partId=${partId}`, "DELETE"), {
      notice: "Part removed.",
      onSuccess: () => router.refresh(),
    });
  }

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-5 font-display text-lg font-bold text-navy-900">Manage this repair</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rm-status">Status</Label>
          <Select id="rm-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {REPAIR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="rm-tech">Assigned technician</Label>
          <Input id="rm-tech" value={form.technician} onChange={(e) => set("technician", e.target.value)} maxLength={200} placeholder="e.g. K. Mensah" />
        </div>
        {form.status !== repair.status ? (
          <div className="sm:col-span-2">
            <Label htmlFor="rm-statusnote">Status change note <span className="font-normal text-mist-500">(optional, recorded in history)</span></Label>
            <Input id="rm-statusnote" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} maxLength={1000} placeholder="e.g. Customer approved estimate by phone" />
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <Label htmlFor="rm-diag">Diagnosis</Label>
          <Textarea id="rm-diag" value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} rows={3} maxLength={5000} placeholder="What the inspection found…" />
        </div>
        <div>
          <Label htmlFor="rm-cost">Estimated repair cost (GHS)</Label>
          <Input id="rm-cost" type="number" min="0" step="0.01" value={form.estimatedCost} onChange={(e) => set("estimatedCost", e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <Label htmlFor="rm-approved">Customer approval of estimate</Label>
          <Select
            id="rm-approved"
            value={form.estimateApproved === true ? "yes" : form.estimateApproved === false ? "no" : "pending"}
            onChange={(e) => set("estimateApproved", e.target.value === "yes" ? true : e.target.value === "no" ? false : null)}
          >
            <option value="pending">Pending</option>
            <option value="yes">Approved</option>
            <option value="no">Declined</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="rm-work">Repair work performed</Label>
          <Textarea id="rm-work" value={form.workPerformed} onChange={(e) => set("workPerformed", e.target.value)} rows={3} maxLength={5000} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="rm-testing">Testing & quality check results</Label>
          <Textarea id="rm-testing" value={form.testingResults} onChange={(e) => set("testingResults", e.target.value)} rows={2} maxLength={5000} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="rm-warranty">Warranty terms <span className="font-normal text-mist-500">(only if offering one)</span></Label>
          <Textarea id="rm-warranty" value={form.warrantyTerms} onChange={(e) => set("warrantyTerms", e.target.value)} rows={2} maxLength={2000} placeholder="e.g. 30-day warranty on replaced parts, excluding liquid damage. Leave empty for no warranty." />
        </div>
      </div>

      {/* Parts */}
      <div className="mt-6 border-t border-mist-200 pt-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-mist-500">Parts ({parts.length})</h3>
        {parts.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {parts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-mist-50 px-4 py-2.5 text-sm">
                <span>
                  <span className="font-medium text-navy-900">{p.name}</span>
                  <span className="text-mist-500"> × {Number(p.quantity)}{p.unitCost ? ` · ₵${Number(p.unitCost).toFixed(2)} each` : ""}</span>
                </span>
                <span className="flex items-center gap-2.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.status === "used" || p.status === "received" ? "bg-emerald-50 text-emerald-700" : p.status === "ordered" ? "bg-amber-50 text-amber-700" : "bg-mist-200 text-mist-600"}`}>
                    {p.status}
                  </span>
                  <button type="button" onClick={() => removePart(p.id)} disabled={busy} className="rounded-lg p-1 text-mist-400 transition-colors hover:bg-white hover:text-red-600" aria-label={`Remove part ${p.name}`}>
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-mist-500">No parts recorded.</p>
        )}
        <div className="grid gap-2.5 sm:grid-cols-[1fr_90px_120px_130px_auto]">
          <Input placeholder="Part name" aria-label="Part name" value={newPart.name} onChange={(e) => setNewPart((p) => ({ ...p, name: e.target.value }))} maxLength={300} />
          <Input type="number" min="1" step="1" aria-label="Quantity" value={newPart.quantity} onChange={(e) => setNewPart((p) => ({ ...p, quantity: e.target.value }))} />
          <Input type="number" min="0" step="0.01" placeholder="Unit cost" aria-label="Unit cost (GHS)" value={newPart.unitCost} onChange={(e) => setNewPart((p) => ({ ...p, unitCost: e.target.value }))} />
          <Select aria-label="Part status" value={newPart.status} onChange={(e) => setNewPart((p) => ({ ...p, status: e.target.value }))}>
            <option value="needed">Needed</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="used">Used</option>
          </Select>
          <Button type="button" variant="outline" onClick={addPart} disabled={busy || !newPart.name.trim()}>
            <Icon name="plus" className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 border-t border-mist-200 pt-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-mist-500">Add a note</h3>
        <div className="grid gap-2.5 sm:grid-cols-[180px_1fr]">
          <Select aria-label="Note type" value={noteKind} onChange={(e) => setNoteKind(e.target.value)}>
            <option value="note">Internal note</option>
            <option value="diagnosis">Diagnosis update</option>
            <option value="customer_communication">Customer communication</option>
          </Select>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={2000} placeholder="Recorded with your name and timestamp…" aria-label="Note" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
        <Button onClick={saveAll} disabled={busy} size="lg" className="w-full sm:w-auto">
          {busy ? "Saving…" : "Save all changes"}
        </Button>
      </div>
    </div>
  );
}
