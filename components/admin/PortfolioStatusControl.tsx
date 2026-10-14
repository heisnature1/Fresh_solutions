"use client";

import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button } from "@/components/ui";

export function PortfolioStatusControl({ projectId, status }: { projectId: string; status: string }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();

  async function setStatus(next: string) {
    await run(() => apiCall(`/api/admin/portfolio/${projectId}`, "PATCH", { status: next }), {
      notice: next === "published" ? "Project is now live on the public portfolio." : `Project moved to ${next}.`,
      onSuccess: () => router.refresh(),
    });
  }

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-navy-900">
          Status: <span className="capitalize">{status}</span>
        </p>
        <span className="flex-1" />
        {status !== "published" ? (
          <Button size="sm" onClick={() => setStatus("published")} disabled={busy}>
            Publish
          </Button>
        ) : null}
        {status === "published" ? (
          <Button size="sm" variant="outline" onClick={() => setStatus("draft")} disabled={busy}>
            Unpublish to draft
          </Button>
        ) : null}
        {status !== "archived" ? (
          <Button size="sm" variant="outline" onClick={() => setStatus("archived")} disabled={busy}>
            Archive
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setStatus("draft")} disabled={busy}>
            Restore to draft
          </Button>
        )}
      </div>
      <div className="mt-3 space-y-2">
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
        <p className="text-xs text-mist-500">
          Publishing via this button requires the project to already have a summary and description.
        </p>
      </div>
    </div>
  );
}
