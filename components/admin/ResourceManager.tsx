"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export interface ResourceRow {
  id: string;
  title: string;
  description: string | null;
  originalName: string;
  sizeLabel: string;
  mimeType: string;
  published: boolean;
  createdAt: string;
  url: string | null;
}

export function ResourceManager({ resources }: { resources: ResourceRow[] }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function upload(publish: boolean) {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("file", file);
    if (publish) fd.set("publish", "1");
    await run(() => apiCall("/api/admin/resources", "POST", fd), {
      notice: publish ? "Resource published." : "Resource saved as hidden (unpublished).",
      onSuccess: () => {
        setTitle(""); setDescription("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      },
    });
  }

  async function toggle(id: string, published: boolean) {
    await run(() => apiCall("/api/admin/resources", "PATCH", { id, published }), {
      onSuccess: () => router.refresh(),
    });
  }

  async function remove(id: string) {
    await run(() => apiCall(`/api/admin/resources?id=${id}`, "DELETE"), { onSuccess: () => router.refresh() });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Upload a resource</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="rs-title" required>Title</Label><Input id="rs-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} placeholder="e.g. Cyber hygiene checklist for SMEs" /></div>
          <div>
            <Label htmlFor="rs-file" required>File <span className="font-normal text-mist-500">(PDF, TXT, PNG/JPG, DOCX · max 15 MB)</span></Label>
            <input
              id="rs-file"
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg,.docx"
              className="block w-full rounded-xl border border-mist-300 px-3 py-2 text-sm text-mist-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>
          <div className="sm:col-span-2"><Label htmlFor="rs-desc">Description</Label><Textarea id="rs-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} /></div>
        </div>
        <div className="mt-4 space-y-3">
          <ErrorBanner message={error} />
          <NoticeBanner message={notice} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => upload(true)} disabled={busy || !title.trim()}>
              <Icon name="plus" className="h-4 w-4" /> {busy ? "Uploading…" : "Upload & publish"}
            </Button>
            <Button onClick={() => upload(false)} disabled={busy || !title.trim()} variant="outline">Upload (keep hidden)</Button>
          </div>
        </div>
      </div>

      {resources.length > 0 ? (
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-mist-200 bg-white p-4 shadow-card sm:px-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-100 text-electric-700">
                <Icon name="file-text" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-navy-900">{r.title}</p>
                <p className="truncate text-xs text-mist-500">
                  {r.originalName} · {r.sizeLabel} · {r.createdAt}
                  {r.description ? ` — ${r.description}` : ""}
                </p>
              </div>
              {r.url ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-mist-400 transition-colors hover:bg-mist-100 hover:text-electric-700" aria-label={`Open ${r.title}`}>
                  <Icon name="external" className="h-4 w-4" />
                </a>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => toggle(r.id, !r.published)} disabled={busy}>
                {r.published ? "Unpublish" : "Publish"}
              </Button>
              <button type="button" onClick={() => remove(r.id)} disabled={busy} className="rounded-lg p-2 text-mist-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${r.title}`}>
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
