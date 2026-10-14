"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner } from "./client-utils";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { INDUSTRIES, SERVICES } from "@/lib/constants";

export interface PortfolioImage {
  id?: string;
  url?: string;
  alt: string;
}

export interface PortfolioFormData {
  status: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  problem: string;
  solution: string;
  deliverables: string;
  results: string;
  technologies: string;
  category: string;
  industry: string;
  liveUrl: string;
  externalUrl: string;
  featured: boolean;
}

export function PortfolioEditor({
  mode,
  projectId,
  initial,
  existingImages = [],
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial: PortfolioFormData;
  existingImages?: PortfolioImage[];
}) {
  const router = useRouter();
  const { busy, error, run } = useBusy();
  const [f, setF] = useState<PortfolioFormData>(initial);
  const [newAlt, setNewAlt] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const set = (k: keyof PortfolioFormData, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function save(publish = false) {
    const payload = {
      title: f.title,
      slug: f.slug || undefined,
      summary: f.summary || undefined,
      description: f.description || undefined,
      problem: f.problem || undefined,
      solution: f.solution || undefined,
      deliverables: f.deliverables || undefined,
      results: f.results || undefined,
      technologies: f.technologies.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 40),
      category: f.category || undefined,
      industry: f.industry || undefined,
      liveUrl: f.liveUrl || undefined,
      externalUrl: f.externalUrl || undefined,
      featured: f.featured,
    };

    if (mode === "create") {
      await run(() => apiCall("/api/admin/portfolio", "POST", payload), {
        onSuccess: (data) => { router.push(`/admin/portfolio/${data?.id}`); router.refresh(); },
      });
      return;
    }

    const fd = new FormData();
    fd.set("data", JSON.stringify(payload));
    if (publish) fd.set("publish", "1");
    pendingFiles.forEach((file) => fd.append("images", file));
    if (pendingFiles.length > 0) fd.set("alt_0", newAlt.trim());
    await run(() => apiCall(`/api/admin/portfolio/${projectId}`, "PATCH", fd), {
      onSuccess: () => { setPendingFiles([]); setNewAlt(""); router.refresh(); },
    });
  }

  async function removeImage(imageId: string) {
    await run(() => apiCall(`/api/admin/portfolio/${projectId}?imageId=${imageId}`, "DELETE"), {
      onSuccess: () => router.refresh(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Project content</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="pf-title" required>Title</Label><Input id="pf-title" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={300} /></div>
          <div><Label htmlFor="pf-slug">URL slug <span className="font-normal text-mist-500">(auto from title if empty)</span></Label><Input id="pf-slug" value={f.slug} onChange={(e) => set("slug", e.target.value)} maxLength={200} placeholder="e.g. solar-pump-project" /></div>
          <div className="sm:col-span-2">
            <Label htmlFor="pf-summary">Summary <span className="font-normal text-mist-500">(required before publishing)</span></Label>
            <Textarea id="pf-summary" value={f.summary} onChange={(e) => set("summary", e.target.value)} rows={2} maxLength={600} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pf-desc">Description <span className="font-normal text-mist-500">(required before publishing)</span></Label>
            <Textarea id="pf-desc" value={f.description} onChange={(e) => set("description", e.target.value)} rows={5} maxLength={10000} />
          </div>
          <div><Label htmlFor="pf-problem">The problem</Label><Textarea id="pf-problem" value={f.problem} onChange={(e) => set("problem", e.target.value)} rows={4} maxLength={6000} /></div>
          <div><Label htmlFor="pf-solution">Our solution</Label><Textarea id="pf-solution" value={f.solution} onChange={(e) => set("solution", e.target.value)} rows={4} maxLength={6000} /></div>
          <div><Label htmlFor="pf-deliv">Deliverables</Label><Textarea id="pf-deliv" value={f.deliverables} onChange={(e) => set("deliverables", e.target.value)} rows={4} maxLength={6000} /></div>
          <div>
            <Label htmlFor="pf-results">Results & impact</Label>
            <Textarea id="pf-results" value={f.results} onChange={(e) => set("results", e.target.value)} rows={4} maxLength={6000} placeholder="Only outcomes you can stand behind — never invented figures." />
          </div>
          <div>
            <Label htmlFor="pf-cat">Service category</Label>
            <select id="pf-cat" value={f.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-xl border border-mist-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-200">
              <option value="">Not categorised</option>
              {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="pf-industry">Industry</Label>
            <select id="pf-industry" value={f.industry} onChange={(e) => set("industry", e.target.value)} className="w-full rounded-xl border border-mist-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-200">
              <option value="">Not specified</option>
              {INDUSTRIES.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pf-tech">Technologies <span className="font-normal text-mist-500">(comma separated)</span></Label>
            <Input id="pf-tech" value={f.technologies} onChange={(e) => set("technologies", e.target.value)} maxLength={500} placeholder="e.g. React, Node.js, PostgreSQL" />
          </div>
          <div><Label htmlFor="pf-live">Live site URL</Label><Input id="pf-live" type="url" value={f.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://…" /></div>
          <div><Label htmlFor="pf-ext">External link</Label><Input id="pf-ext" type="url" value={f.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://…" /></div>
        </div>
        <label className="mt-4 flex items-start gap-3">
          <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-mist-300 text-electric-600 focus:ring-electric-500" />
          <span>
            <span className="block text-sm font-semibold text-navy-900">Feature on the home page & portfolio top</span>
            <span className="block text-xs text-mist-500">Only takes effect once published.</span>
          </span>
        </label>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Images</h2>
        {mode === "create" ? (
          <p className="text-sm text-mist-500">Create the project first — you can add images on the next screen.</p>
        ) : (
          <>
            {existingImages.length > 0 ? (
              <ul className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {existingImages.map((img) => (
                  <li key={img.id} className="relative overflow-hidden rounded-xl border border-mist-200">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of storage-backed file */}
                    <img src={img.url} alt={img.alt} className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-2.5">
                      <span className="truncate text-xs text-mist-500">{img.alt}</span>
                      <button type="button" onClick={() => removeImage(img.id!)} disabled={busy} className="rounded-lg p-1.5 text-mist-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Remove image ${img.alt}`}>
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-sm text-mist-500">No images yet — the public card falls back to a branded placeholder.</p>
            )}
            <div className="flex flex-wrap items-end gap-2.5">
              <div className="min-w-[220px] flex-1">
                <Label htmlFor="pf-imgfile">Add image (PNG/JPG/WebP)</Label>
                <input
                  id="pf-imgfile"
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setPendingFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="block w-full text-xs text-mist-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                />
                {pendingFiles.length > 0 ? <p className="mt-1 text-xs text-mist-500">{pendingFiles.length} file(s) ready — saved when you click a save button below.</p> : null}
              </div>
              <div className="min-w-[200px]">
                <Label htmlFor="pf-alt">Alt text for first image</Label>
                <Input id="pf-alt" value={newAlt} onChange={(e) => setNewAlt(e.target.value)} maxLength={280} placeholder="Describe the image" />
              </div>
            </div>
          </>
        )}
      </div>

      <ErrorBanner message={error} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => save(false)} disabled={busy || !f.title.trim()} size="lg">
          {busy ? "Saving…" : mode === "create" ? "Create draft project" : "Save changes"}
        </Button>
        {mode === "edit" && (f.status === "draft" || f.status === "archived") ? (
          <Button onClick={() => save(true)} disabled={busy || !f.title.trim()} variant="secondary" size="lg">
            Save & publish
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => router.push("/admin/portfolio")}>Back to list</Button>
      </div>
      {mode === "edit" && (f.status === "draft" || f.status === "archived") ? (
        <p className="text-xs text-mist-500">Publishing requires a summary and a description. Status otherwise stays {f.status}.</p>
      ) : null}
    </div>
  );
}
