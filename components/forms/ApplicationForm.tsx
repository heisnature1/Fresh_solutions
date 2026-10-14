"use client";

import { useState } from "react";
import { postFormData, SubmitState } from "./shared";
import { Honeypot } from "./ContactForm";
import { Button, FieldError, Input, Label, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export function ApplicationForm({ vacancyId, vacancyTitle }: { vacancyId: string; vacancyTitle: string }) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [cv, setCv] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return;
    setState({ status: "submitting" });
    const data = new FormData(e.currentTarget);
    const fd = new FormData();
    fd.set(
      "data",
      JSON.stringify({
        vacancyId,
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        statement: data.get("statement") || undefined,
        website: data.get("website") || "",
      }),
    );
    if (cv) fd.append("cv", cv);
    const result = await postFormData("/api/applications", fd);
    setState(result);
    if (result.status === "success") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <h2 className="font-display text-xl font-bold text-emerald-900">Application received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800">
          Thank you for applying for <strong>{vacancyTitle}</strong>. Your reference is{" "}
          <strong className="font-mono">{state.reference}</strong>. We review every application carefully and will
          contact you if you are shortlisted.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4" encType="multipart/form-data">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ap-name" required>Full name</Label>
          <Input id="ap-name" name="name" required maxLength={200} autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="ap-email" required>Email</Label>
          <Input id="ap-email" name="email" type="email" required maxLength={320} autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="ap-phone" required>Telephone</Label>
          <Input id="ap-phone" name="phone" type="tel" required maxLength={40} autoComplete="tel" />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.phone : undefined)}</FieldError>
        </div>
        <div>
          <Label htmlFor="ap-cv" required>CV (PDF or Word, max 8 MB)</Label>
          <input
            id="ap-cv"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="mt-1 block w-full text-sm text-mist-600 file:mr-4 file:rounded-xl file:border-0 file:bg-electric-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-electric-700 hover:file:bg-electric-100"
            onChange={(e) => setCv(e.target.files?.[0] ?? null)}
          />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.cv : undefined)}</FieldError>
        </div>
      </div>
      <div>
        <Label htmlFor="ap-statement">Relevant experience or statement <span className="font-normal text-mist-500">(optional)</span></Label>
        <Textarea id="ap-statement" name="statement" maxLength={6000} rows={5} placeholder="Tell us briefly about your background and why this role interests you." />
      </div>

      <div className="rounded-xl border border-mist-200 bg-mist-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">Privacy notice</p>
        <p className="mt-1.5 text-xs leading-relaxed text-mist-600">
          Your application details and CV are used solely to assess your suitability for this and closely related
          roles at Fresh Solutions. They are stored privately, visible only to the people reviewing applications,
          and retained no longer than our recruitment process requires. You may ask us to delete your application
          at any time by contacting us.
        </p>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-navy-900">
          <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-electric-600" />
          I understand and agree to this use of my information. <span className="sr-only">(required)</span>
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={state.status === "submitting" || !agreed}>
        {state.status === "submitting" ? "Submitting…" : "Submit application"}
        <Icon name="send" className="h-4 w-4" />
      </Button>
    </form>
  );
}
