"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { APPLICATION_STATUSES } from "@/lib/constants";

export interface ApplicationData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  statement: string | null;
  status: string;
  interviewAt: string | null;
  interviewNotes: string;
  createdAt: string;
  cvName: string | null;
  reference: string;
}

export function ApplicationManager({ application: a, vacancyTitle }: { application: ApplicationData; vacancyTitle: string }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [status, setStatus] = useState(a.status);
  const [interviewAt, setInterviewAt] = useState(a.interviewAt ? a.interviewAt.slice(0, 16) : "");
  const [interviewNotes, setInterviewNotes] = useState(a.interviewNotes);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  async function save() {
    await run(
      () =>
        apiCall(`/api/admin/applications/${a.id}`, "PATCH", {
          status,
          interviewAt: interviewAt ? interviewAt : undefined,
          interviewNotes,
          note: note.trim() || undefined,
        }),
      {
        notice: "Application updated.",
        onSuccess: () => { setNote(""); router.refresh(); },
      },
    );
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });

  return (
    <div className="rounded-2xl border border-mist-200 bg-white shadow-card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-left sm:px-5" aria-expanded={open}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric-100 font-display text-sm font-bold text-electric-700">
          {(a.fullName || "?").charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-bold text-navy-900">{a.fullName}</span>
          <span className="block text-xs text-mist-500">{a.email} · {fmt(a.createdAt)}</span>
        </span>
        <span className="flex-1" />
        <span className="rounded-full bg-mist-100 px-2.5 py-1 text-xs font-semibold capitalize text-mist-700">{a.status.replace("_", " ")}</span>
        <Icon name="chevron-down" className={`h-4 w-4 text-mist-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="border-t border-mist-100 p-4 sm:p-5">
          <dl className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Role</dt><dd className="text-sm text-navy-900">{vacancyTitle}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Reference</dt><dd className="font-mono text-sm text-navy-900">{a.reference}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Phone</dt><dd className="text-sm text-navy-900">{a.phone}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Email</dt><dd className="text-sm text-navy-900"><a href={`mailto:${a.email}`} className="text-electric-700 underline underline-offset-2">{a.email}</a></dd></div>
            <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Cover note & background</dt><dd className="whitespace-pre-wrap text-sm text-navy-900">{a.statement ?? "—"}</dd></div>
          </dl>

          <div className="mt-4">
            <a href={`/api/admin/applications/${a.id}/cv`} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
              <Icon name="download" className="h-4 w-4" /> Download CV{a.cvName ? ` (${a.cvName})` : ""}
            </a>
            <p className="mt-1.5 text-xs text-mist-400">Private, time-limited link — generated on demand, never public.</p>
          </div>

          <div className="mt-5 grid gap-4 border-t border-mist-100 pt-5 sm:grid-cols-2">
            <div>
              <Label htmlFor={`st-${a.id}`}>Stage</Label>
              <Select id={`st-${a.id}`} value={status} onChange={(e) => setStatus(e.target.value)}>
                {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor={`iv-${a.id}`}>Interview date & time (UTC)</Label>
              <Input id={`iv-${a.id}`} type="datetime-local" value={interviewAt} onChange={(e) => setInterviewAt(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor={`ivn-${a.id}`}>Interview notes <span className="font-normal text-mist-500">(internal)</span></Label>
              <Textarea id={`ivn-${a.id}`} value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} rows={2} maxLength={3000} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor={`note-${a.id}`}>Add internal note</Label>
              <Textarea id={`note-${a.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={2000} placeholder="Recorded with your name and timestamp…" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ErrorBanner message={error} />
            <NoticeBanner message={notice} />
            <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
