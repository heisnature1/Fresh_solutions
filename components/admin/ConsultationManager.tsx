"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { CONSULTATION_STATUSES } from "@/lib/constants";
import { Icon } from "@/components/icons";

export function ConsultationManager({
  consultation,
}: {
  consultation: { id: string; status: string; confirmedDate: string; confirmedTime: string; adminNotes: string };
}) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [status, setStatus] = useState(consultation.status);
  const [confirmedAt, setConfirmedAt] = useState(consultation.confirmedDate);
  const [confirmedTime, setConfirmedTime] = useState(consultation.confirmedTime);
  const [adminNotes, setAdminNotes] = useState(consultation.adminNotes);

  async function save() {
    await run(
      () =>
        apiCall(`/api/admin/consultations/${consultation.id}`, "PATCH", {
          status,
          confirmedAt: confirmedAt || undefined,
          confirmedTime: confirmedTime || undefined,
          adminNotes,
        }),
      { notice: "Consultation updated.", onSuccess: () => router.refresh() },
    );
  }

  const needsDate = status === "approved";

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
      <h2 className="mb-4 font-display text-base font-bold text-navy-900">Decision</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="cs-status">Decision</Label>
          <Select id="cs-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {CONSULTATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        {needsDate ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cs-date" required>Confirmed date</Label>
              <Input id="cs-date" type="date" value={confirmedAt} onChange={(e) => setConfirmedAt(e.target.value)} required={needsDate} />
            </div>
            <div>
              <Label htmlFor="cs-time">Time</Label>
              <Input id="cs-time" type="time" value={confirmedTime} onChange={(e) => setConfirmedTime(e.target.value)} />
            </div>
          </div>
        ) : null}
        <div>
          <Label htmlFor="cs-notes">Internal notes</Label>
          <Textarea id="cs-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} maxLength={3000} />
        </div>

        {status === "approved" ? (
          <p className="flex items-start gap-2 rounded-xl bg-electric-50 px-4 py-3 text-xs leading-relaxed text-navy-900">
            <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
            Approving emails the customer a confirmation <strong>if email is configured</strong> — the result is shown back to you honestly; never assume it went through silently.
          </p>
        ) : null}

        <ErrorBanner message={error} />
        <NoticeBanner message={notice} />
        <Button onClick={save} disabled={busy || (needsDate && !confirmedAt)}>{busy ? "Saving…" : "Save decision"}</Button>
      </div>
    </div>
  );
}
