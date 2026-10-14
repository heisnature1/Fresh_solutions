"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icons";

export interface TestimonialData {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
  content: string;
  rating: number | null;
  status: string;
  source: string;
  featured: boolean;
  consentRecorded: boolean;
  consentNote: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

export function TestimonialCard({ testimonial: t }: { testimonial: TestimonialData }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [confirming, setConfirming] = useState(false);

  async function moderate(status: string, consent = false) {
    await run(
      () => apiCall(`/api/admin/testimonials/${t.id}${consent ? "?consent=1" : ""}`, "PATCH", { status }),
      { notice: `Testimonial ${status}.`, onSuccess: () => router.refresh() },
    );
  }

  async function toggleFeatured() {
    await run(() => apiCall(`/api/admin/testimonials/${t.id}`, "PATCH", { status: t.status, featured: !t.featured }), {
      onSuccess: () => router.refresh(),
    });
  }

  async function destroy() {
    await run(() => apiCall(`/api/admin/testimonials/${t.id}`, "DELETE"), { onSuccess: () => router.refresh() });
  }

  return (
    <article className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-navy-900">
            {t.name}
            {t.featured ? <span className="ml-2 text-xs font-semibold text-amber-600">★ Featured</span> : null}
          </p>
          <p className="text-xs text-mist-500">
            {[t.role, t.organisation].filter(Boolean).join(" · ") || "No attribution details"}
            {" · "}
            {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {t.rating ? (
            <span className="flex items-center gap-0.5" aria-label={`${t.rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon key={i} name="star" className={`h-3.5 w-3.5 ${i <= (t.rating ?? 0) ? "text-amber-400" : "text-mist-200"}`} />
              ))}
            </span>
          ) : null}
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[t.status] ?? "bg-mist-100"}`}>{t.status}</span>
          <span className="rounded-full bg-mist-100 px-2.5 py-1 text-xs font-semibold capitalize text-mist-600">{t.source === "admin" ? "Recorded by you" : "Customer-submitted"}</span>
        </div>
      </div>

      <blockquote className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-mist-700">“{t.content}”</blockquote>

      <p className="mt-3 flex items-start gap-1.5 text-xs text-mist-500">
        <Icon name={t.consentRecorded ? "check-circle" : "info"} className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${t.consentRecorded ? "text-emerald-500" : "text-amber-500"}`} />
        {t.consentRecorded
          ? `Consent recorded${t.consentNote ? `: ${t.consentNote}` : "."}`
          : "No consent on record — cannot be approved until consent is confirmed."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-mist-100 pt-4">
        {t.status !== "approved" ? (
          t.source === "customer" && !t.consentRecorded ? (
            <Button size="sm" onClick={() => moderate("approved", true)} disabled={busy}>
              Approve & record consent
            </Button>
          ) : (
            <Button size="sm" onClick={() => moderate("approved")} disabled={busy}>Approve</Button>
          )
        ) : (
          <Button size="sm" variant="outline" onClick={() => moderate("pending")} disabled={busy}>Unpublish</Button>
        )}
        {t.status !== "rejected" && t.status !== "approved" ? (
          <Button size="sm" variant="outline" onClick={() => moderate("rejected")} disabled={busy}>Reject</Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={toggleFeatured} disabled={busy}>
          {t.featured ? "Unfeature" : "Feature"}
        </Button>
        <span className="flex-1" />
        {!confirming ? (
          <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete…</Button>
        ) : (
          <>
            <span className="text-sm text-mist-600">Delete permanently?</span>
            <Button size="sm" onClick={destroy} disabled={busy} className="bg-red-600 hover:bg-red-500">Yes, delete</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        )}
      </div>
      <div className="mt-3 space-y-2">
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
      </div>
    </article>
  );
}
