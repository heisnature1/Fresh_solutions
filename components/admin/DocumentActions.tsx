"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Select } from "@/components/ui";
import { Icon } from "@/components/icons";

const TRANSITION_LABELS: Record<string, string> = {
  sent: "Mark as sent",
  accepted: "Mark accepted",
  rejected: "Mark rejected",
  expired: "Mark expired",
  cancelled: "Cancel document",
  draft: "Revert to draft",
};

const NEXT_STATUSES: Record<string, string[]> = {
  draft: ["sent", "cancelled"],
  sent: ["accepted", "rejected", "expired", "cancelled", "draft"],
  accepted: ["sent"],
  rejected: ["draft"],
  expired: ["sent", "draft"],
  cancelled: [],
};

export function DocumentActions({
  kind,
  id,
  status,
}: {
  kind: "quotations" | "proposals";
  id: string;
  status: string;
}) {
  const router = useRouter();
  const { busy, error, notice, run, setNotice } = useBusy();
  const [nextStatus, setNextStatus] = useState(NEXT_STATUSES[status]?.[0] ?? "sent");

  async function applyStatus() {
    await run(() => apiCall(`/api/admin/${kind}/${id}/status`, "POST", { status: nextStatus }), {
      notice: "Status updated.",
      onSuccess: () => router.refresh(),
    });
  }

  async function emailDoc() {
    await run(() => apiCall(`/api/admin/${kind}/${id}/email`, "POST"), {
      onSuccess: (data) => {
        if (typeof data?.message === "string") setNotice(data.message);
        router.refresh();
      },
    });
  }

  const transitions = NEXT_STATUSES[status] ?? [];

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
      <h2 className="mb-4 font-display text-base font-bold text-navy-900">Document actions</h2>
      <div className="space-y-3.5">
        {transitions.length > 0 ? (
          <div className="flex gap-2">
            <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} aria-label="Next status">
              {transitions.map((s) => <option key={s} value={s}>{TRANSITION_LABELS[s] ?? s}</option>)}
            </Select>
            <Button onClick={applyStatus} disabled={busy} variant="secondary">Apply</Button>
          </div>
        ) : (
          <p className="text-sm text-mist-500">This document is in a final state.</p>
        )}

        <div className="flex flex-wrap gap-2.5">
          <a
            href={`/api/admin/${kind}/${id}/pdf?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400"
          >
            <Icon name="eye" className="h-4 w-4" /> Preview PDF
          </a>
          <a
            href={`/api/admin/${kind}/${id}/pdf`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400"
          >
            <Icon name="download" className="h-4 w-4" /> Download PDF
          </a>
          <Button onClick={emailDoc} disabled={busy} variant="outline">
            <Icon name="mail" className="h-4 w-4" /> {busy ? "Working…" : "Email to client"}
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-mist-500">
          Emailing attaches the PDF and marks the document as sent. If email is not configured you will see an
          honest error instead of a false success.
        </p>
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
      </div>
    </div>
  );
}
