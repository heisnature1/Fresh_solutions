"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiCall, useBusy, ErrorBanner } from "./client-utils";
import { Button, Input, Label, Textarea } from "@/components/ui";

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagsCsv: string;
  authorName: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  scheduledAt: string;
}

export function ArticleEditor({
  mode,
  articleId,
  initial,
  categories,
}: {
  mode: "create" | "edit";
  articleId?: string;
  initial: ArticleFormData;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const { busy, error, run } = useBusy();
  const [f, setF] = useState<ArticleFormData>(initial);
  const [showPreview, setShowPreview] = useState(false);

  const set = (k: keyof ArticleFormData, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    const payload = {
      title: f.title,
      slug: f.slug || undefined,
      excerpt: f.excerpt || undefined,
      content: f.content,
      categoryId: f.categoryId || undefined,
      tagsCsv: f.tagsCsv || undefined,
      authorName: f.authorName || undefined,
      featured: f.featured,
      seoTitle: f.seoTitle || undefined,
      seoDescription: f.seoDescription || undefined,
      scheduledAt: f.scheduledAt || undefined,
    };
    await run(
      () =>
        mode === "create"
          ? apiCall("/api/admin/articles", "POST", payload)
          : apiCall(`/api/admin/articles/${articleId}`, "PATCH", payload),
      {
        onSuccess: (data) => {
          router.push(`/admin/articles/${mode === "create" ? data?.id : articleId}`);
          router.refresh();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">Article</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="ar-title" required>Title</Label><Input id="ar-title" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={300} /></div>
          <div><Label htmlFor="ar-slug">URL slug <span className="font-normal text-mist-500">(auto if empty)</span></Label><Input id="ar-slug" value={f.slug} onChange={(e) => set("slug", e.target.value)} maxLength={220} /></div>
          <div>
            <Label htmlFor="ar-cat">Category</Label>
            <select id="ar-cat" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="w-full rounded-xl border border-mist-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-200">
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ar-excerpt">Excerpt <span className="font-normal text-mist-500">(shown on listing cards)</span></Label>
            <Textarea id="ar-excerpt" value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} maxLength={600} />
          </div>
          <div>
            <Label htmlFor="ar-author">Author name</Label>
            <Input id="ar-author" value={f.authorName} onChange={(e) => set("authorName", e.target.value)} maxLength={200} placeholder="Fresh Solutions Team" />
          </div>
          <div>
            <Label htmlFor="ar-tags">Tags <span className="font-normal text-mist-500">(comma separated)</span></Label>
            <Input id="ar-tags" value={f.tagsCsv} onChange={(e) => set("tagsCsv", e.target.value)} maxLength={500} placeholder="e.g. security, smes, backup" />
          </div>
          <div>
            <Label htmlFor="ar-when">Schedule for <span className="font-normal text-mist-500">(optional — future date publishes from then)</span></Label>
            <Input id="ar-when" type="date" value={f.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
          </div>
          <label className="flex items-end gap-3 pb-1">
            <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded border-mist-300 text-electric-600 focus:ring-electric-500" />
            <span className="text-sm font-medium text-navy-900">Feature in the knowledge centre</span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-navy-900">Content <span className="ml-1 text-xs font-normal text-mist-500">Markdown supported</span></h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview((s) => !s)}>
            {showPreview ? "Hide preview" : "Preview render"}
          </Button>
        </div>
        <Textarea
          value={f.content}
          onChange={(e) => set("content", e.target.value)}
          rows={16}
          className="font-mono text-[13px] leading-relaxed"
          aria-label="Article content (Markdown)"
          placeholder={"## Why this matters\n\nWrite your article in Markdown…\n\n- Lists\n- **Bold**, `code`, links, quotes"}
        />
        {showPreview ? <LivePreview markdown={f.content} /> : null}
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">SEO</h2>
        <div className="space-y-4">
          <div><Label htmlFor="ar-seot">SEO title <span className="font-normal text-mist-500">({f.seoTitle.length}/300)</span></Label><Input id="ar-seot" value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} maxLength={300} placeholder="Defaults to the article title" /></div>
          <div><Label htmlFor="ar-seod">SEO description <span className="font-normal text-mist-500">({f.seoDescription.length}/400)</span></Label><Textarea id="ar-seod" value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} maxLength={400} placeholder="Defaults to the excerpt" /></div>
        </div>
      </div>

      <ErrorBanner message={error} />
      <div className="flex gap-3">
        <Button onClick={save} disabled={busy || !f.title.trim() || !f.content.trim()} size="lg">
          {busy ? "Saving…" : mode === "create" ? "Create draft article" : "Save article"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/admin/articles")}>Back to list</Button>
      </div>
      <p className="text-xs text-mist-500">Articles are created as drafts — publish them from the article page when ready.</p>
    </div>
  );
}

/** Live preview — renders with the same react-markdown pipeline as the public site. */
function LivePreview({ markdown }: { markdown: string }) {
  return (
    <div className="mt-4 rounded-xl border border-mist-200 bg-mist-50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-500">Rendered preview</p>
      <div className="article-body text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
