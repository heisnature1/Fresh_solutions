"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button } from "@/components/ui";

export function ArticleActions({ articleId, status, slug }: { articleId: string; status: string; slug: string }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [confirming, setConfirming] = useState(false);

  async function action(a: "publish" | "unpublish" | "archive") {
    await run(() => apiCall(`/api/admin/articles/${articleId}`, "PATCH", { action: a }), {
      notice: a === "publish" ? "Article is live on the knowledge centre." : a === "archive" ? "Article archived." : "Article moved back to draft.",
      onSuccess: () => router.refresh(),
    });
  }

  async function destroy() {
    await run(() => apiCall(`/api/admin/articles/${articleId}`, "DELETE"), {
      onSuccess: () => { router.push("/admin/articles"); router.refresh(); },
    });
  }

  return (
    <div className="mb-6 rounded-2xl border border-mist-200 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-navy-900">Status: <span className="capitalize">{status}</span></p>
        {status === "published" ? (
          <a href={`/knowledge/${slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-electric-700 underline underline-offset-2">View live ↗</a>
        ) : null}
        <span className="flex-1" />
        {status !== "published" ? <Button size="sm" onClick={() => action("publish")} disabled={busy}>Publish</Button> : null}
        {status === "published" ? <Button size="sm" variant="outline" onClick={() => action("unpublish")} disabled={busy}>Unpublish</Button> : null}
        {status !== "archived" ? <Button size="sm" variant="outline" onClick={() => action("archive")} disabled={busy}>Archive</Button> : (
          <Button size="sm" variant="outline" onClick={() => action("unpublish")} disabled={busy}>Restore to draft</Button>
        )}
        <span className="mx-1 h-6 w-px bg-mist-200" aria-hidden />
        {!confirming ? (
          <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete…</Button>
        ) : (
          <>
            <span className="text-sm text-mist-600">Permanently delete this article?</span>
            <Button size="sm" onClick={destroy} disabled={busy} className="bg-red-600 hover:bg-red-500">Yes, delete</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        )}
      </div>
      <div className="mt-3 space-y-2">
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
      </div>
    </div>
  );
}
