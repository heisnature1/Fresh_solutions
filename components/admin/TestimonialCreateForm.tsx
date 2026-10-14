"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

export function TestimonialCreateForm() {
  const router = useRouter();
  const { busy, error, notice, run, setError } = useBusy();
  const [f, setF] = useState({
    name: "", role: "", organisation: "", content: "", rating: "5",
    consentRecorded: false, consentNote: "", featured: false,
  });

  async function save() {
    if (!f.consentRecorded) {
      setError("Tick the consent confirmation — a testimonial may only be published with the client's permission.");
      return;
    }
    await run(
      () =>
        apiCall("/api/admin/testimonials", "POST", {
          name: f.name,
          role: f.role || undefined,
          organisation: f.organisation || undefined,
          content: f.content,
          rating: f.rating,
          consentRecorded: true,
          consentNote: f.consentNote || undefined,
          featured: f.featured,
        }),
      {
        notice: "Testimonial recorded and approved.",
        onSuccess: () => {
          setF({ name: "", role: "", organisation: "", content: "", rating: "5", consentRecorded: false, consentNote: "", featured: false });
          router.refresh();
        },
      },
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor="tt-name" required>Client name</Label><Input id="tt-name" value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} maxLength={200} /></div>
      <div><Label htmlFor="tt-role">Their role</Label><Input id="tt-role" value={f.role} onChange={(e) => setF((p) => ({ ...p, role: e.target.value }))} maxLength={200} placeholder="e.g. Operations Manager" /></div>
      <div><Label htmlFor="tt-org">Organisation</Label><Input id="tt-org" value={f.organisation} onChange={(e) => setF((p) => ({ ...p, organisation: e.target.value }))} maxLength={200} /></div>
      <div>
        <Label htmlFor="tt-rating">Rating</Label>
        <Select id="tt-rating" value={f.rating} onChange={(e) => setF((p) => ({ ...p, rating: e.target.value }))}>
          {["5", "4", "3", "2", "1"].map((r) => <option key={r} value={r}>{r} / 5</option>)}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="tt-content" required>Their words</Label>
        <Textarea id="tt-content" value={f.content} onChange={(e) => setF((p) => ({ ...p, content: e.target.value }))} rows={3} maxLength={1500} placeholder="Quote the client exactly as they said or wrote it." />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="tt-consent">Consent details <span className="font-normal text-mist-500">(how and when they agreed)</span></Label>
        <Textarea id="tt-consent" value={f.consentNote} onChange={(e) => setF((p) => ({ ...p, consentNote: e.target.value }))} rows={2} maxLength={1000} placeholder="e.g. 'By email on 12 Oct 2026 — happy for this to appear on the website with name and company.'" />
      </div>
      <label className="flex items-start gap-3 sm:col-span-2">
        <input type="checkbox" checked={f.consentRecorded} onChange={(e) => setF((p) => ({ ...p, consentRecorded: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-mist-300 text-electric-600 focus:ring-electric-500" />
        <span className="text-sm text-navy-900">
          <span className="font-semibold">The client has explicitly agreed</span> to this text appearing publicly on the Fresh Solutions website, with the attribution above.
        </span>
      </label>
      <label className="flex items-center gap-3 sm:col-span-2">
        <input type="checkbox" checked={f.featured} onChange={(e) => setF((p) => ({ ...p, featured: e.target.checked }))} className="h-4 w-4 rounded border-mist-300 text-electric-600 focus:ring-electric-500" />
        <span className="text-sm text-navy-900">Feature on the home page</span>
      </label>
      <div className="space-y-3 sm:col-span-2">
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
        <Button onClick={save} disabled={busy || !f.name.trim() || !f.content.trim()}>{busy ? "Saving…" : "Record testimonial"}</Button>
      </div>
    </div>
  );
}
