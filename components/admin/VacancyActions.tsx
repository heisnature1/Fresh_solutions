"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button } from "@/components/ui";

export function VacancyActions({ vacancyId, status, slug }: { vacancyId: string; status: string; slug: string }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [confirming, setConfirming] = useState(false);

  async function setStatus(next: string) {
    await run(() => apiCall(`/api/admin/vacancies/${vacancyId}`, "PATCH", { status: next }), {
      notice: next === "published" ? "Vacancy is now open publicly." : next === "closed" ? "Vacancy closed — the public page stops accepting applications." : "Vacancy moved back to draft.",
      onSuccess: () => router.refresh(),
    });
  }

  async function destroy() {
    await run(() => apiCall(`/api/admin/vacancies/${vacancyId}`, "DELETE"), {
      onSuccess: () => { router.push("/admin/careers"); router.refresh(); },
    });
  }

  return (
    <div className="mb-6 rounded-2xl border border-mist-200 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-navy-900">
          Status: <span className="capitalize">{status === "published" ? "Open" : status}</span>
        </p>
        {status === "published" ? (
          <a href={`/careers/${slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-electric-700 underline underline-offset-2">View live ↗</a>
        ) : null}
        <span className="flex-1" />
        {status !== "published" ? <Button size="sm" onClick={() => setStatus("published")} disabled={busy}>Publish (open)</Button> : null}
        {status === "published" ? <Button size="sm" variant="outline" onClick={() => setStatus("closed")} disabled={busy}>Close vacancy</Button> : null}
        {status !== "draft" && status !== "published" ? <Button size="sm" variant="outline" onClick={() => setStatus("draft")} disabled={busy}>Back to draft</Button> : null}
        <span className="mx-1 h-6 w-px bg-mist-200" aria-hidden />
        {!confirming ? (
          <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete…</Button>
        ) : (
          <>
            <span className="text-sm text-mist-600">Delete vacancy and all its applications + CV files?</span>
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
