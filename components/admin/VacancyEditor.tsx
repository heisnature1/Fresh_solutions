"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner } from "./client-utils";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { EMPLOYMENT_TYPES, SERVICES } from "@/lib/constants";

export interface VacancyFormData {
  title: string;
  slug: string;
  department: string;
  employmentType: string;
  location: string;
  remote: boolean;
  summary: string;
  responsibilities: string;
  skills: string;
  qualifications: string;
  deadline: string;
  status: string;
}

export function VacancyEditor({
  mode,
  vacancyId,
  initial,
}: {
  mode: "create" | "edit";
  vacancyId?: string;
  initial: VacancyFormData;
}) {
  const router = useRouter();
  const { busy, error, run } = useBusy();
  const [f, setF] = useState<VacancyFormData>(initial);

  const set = (k: keyof VacancyFormData, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    const payload = {
      title: f.title,
      slug: f.slug || undefined,
      department: f.department || undefined,
      employmentType: f.employmentType || undefined,
      location: f.location || undefined,
      remote: f.remote,
      summary: f.summary || undefined,
      responsibilities: f.responsibilities || undefined,
      skills: f.skills || undefined,
      qualifications: f.qualifications || undefined,
      deadline: f.deadline || undefined,
    };
    await run(
      () =>
        mode === "create"
          ? apiCall("/api/admin/vacancies", "POST", payload)
          : apiCall(`/api/admin/vacancies/${vacancyId}`, "PATCH", payload),
      {
        onSuccess: (data) => {
          router.push(`/admin/careers/${mode === "create" ? data?.id : vacancyId}`);
          router.refresh();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Role details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="vc-title" required>Job title</Label><Input id="vc-title" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={200} /></div>
          <div><Label htmlFor="vc-slug">URL slug <span className="font-normal text-mist-500">(auto if empty)</span></Label><Input id="vc-slug" value={f.slug} onChange={(e) => set("slug", e.target.value)} maxLength={220} /></div>
          <div>
            <Label htmlFor="vc-type" required>Employment type</Label>
            <Select id="vc-type" value={f.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
              <option value="">Select…</option>
              {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <div><Label htmlFor="vc-loc">Location</Label><Input id="vc-loc" value={f.location} onChange={(e) => set("location", e.target.value)} maxLength={200} placeholder="e.g. Accra" /></div>
          <div className="sm:col-span-2"><Label htmlFor="vc-deadline">Application deadline</Label><Input id="vc-deadline" type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></div>
          <label className="flex items-start gap-3 sm:col-span-2">
            <input type="checkbox" checked={f.remote} onChange={(e) => set("remote", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-mist-300 text-electric-600 focus:ring-electric-500" />
            <span>
              <span className="block text-sm font-semibold text-navy-900">Remote-friendly role</span>
              <span className="block text-xs text-mist-500">Shown next to the location on the public careers page.</span>
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Job description</h2>
        <div className="space-y-4">
          <div><Label htmlFor="vc-summary">Summary <span className="font-normal text-mist-500">(summary or responsibilities required to publish)</span></Label><Textarea id="vc-summary" value={f.summary} onChange={(e) => set("summary", e.target.value)} rows={3} maxLength={1000} /></div>
          <div><Label htmlFor="vc-resp">Responsibilities <span className="font-normal text-mist-500">(one per line works well)</span></Label><Textarea id="vc-resp" value={f.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} rows={5} maxLength={8000} /></div>
          <div><Label htmlFor="vc-skills">Skills & tools</Label><Textarea id="vc-skills" value={f.skills} onChange={(e) => set("skills", e.target.value)} rows={4} maxLength={6000} /></div>
          <div><Label htmlFor="vc-qual">Qualifications</Label><Textarea id="vc-qual" value={f.qualifications} onChange={(e) => set("qualifications", e.target.value)} rows={4} maxLength={6000} /></div>
        </div>
      </div>

      <ErrorBanner message={error} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={busy || !f.title.trim() || !f.employmentType} size="lg">
          {busy ? "Saving…" : mode === "create" ? "Create draft vacancy" : "Save changes"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/admin/careers")}>Back to list</Button>
      </div>
      <p className="text-xs text-mist-500">
        Vacancies start as drafts — publish them from the vacancy page once a summary or responsibilities are in place. Department, if set, should align with the service areas: {SERVICES.slice(0, 4).map((s) => s.name).join(", ")}, …
      </p>
    </div>
  );
}
