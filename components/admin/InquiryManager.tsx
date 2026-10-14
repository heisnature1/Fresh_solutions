"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Select, Textarea, Label } from "@/components/ui";
import { INQUIRY_STATUSES } from "@/lib/constants";

export function InquiryManager({ inquiryId, status }: { inquiryId: string; status: string }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [nextStatus, setNextStatus] = useState(status);
  const [note, setNote] = useState("");

  async function save() {
    await run(
      () => apiCall(`/api/admin/inquiries/${inquiryId}`, "PATCH", { status: nextStatus, note: note.trim() || undefined }),
      {
        notice: "Inquiry updated.",
        onSuccess: () => { setNote(""); router.refresh(); },
      },
    );
  }

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
      <h2 className="mb-4 font-display text-base font-bold text-navy-900">Manage inquiry</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="inq-status">Pipeline stage</Label>
          <Select id="inq-status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        <div>
        <Label htmlFor="inq-note">Internal note <span className="font-normal text-mist-500">(optional)</span></Label>
          <Textarea id="inq-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} placeholder="Recorded with your name and timestamp…" />
        </div>
        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Update inquiry"}</Button>
      </div>
    </div>
  );
}
