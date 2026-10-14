"use client";

import { useState } from "react";
import { postJson, SubmitState } from "./shared";
import { Honeypot } from "./ContactForm";
import { Button, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export function ConsultationForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "submitting" });
    const data = new FormData(e.currentTarget);
    const result = await postJson("/api/consultations", {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone") || undefined,
      topic: data.get("topic"),
      preferredWindow: data.get("preferredWindow"),
      method: data.get("method") || undefined,
      message: data.get("message") || undefined,
      website: data.get("website") || "",
    });
    setState(result);
    if (result.status === "success") setFormKey((k) => k + 1);
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="check-circle" className="h-6 w-6" />
        </span>
        <h3 className="font-display text-lg font-semibold text-emerald-900">Consultation request received</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-emerald-800">
          Your request is <strong>pending review</strong> — it is not a confirmed booking yet.
          Our team will review it and confirm a date and time with you directly.
          {state.reference ? <> Reference: <strong className="font-mono">{state.reference}</strong>.</> : null}
        </p>
      </div>
    );
  }

  return (
    <form key={formKey} onSubmit={onSubmit} className="relative space-y-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cn-name" required>Full name</Label>
          <Input id="cn-name" name="name" required maxLength={200} autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="cn-email" required>Email</Label>
          <Input id="cn-email" name="email" type="email" required maxLength={320} autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="cn-phone">Telephone / WhatsApp <span className="font-normal text-mist-500">(optional)</span></Label>
          <Input id="cn-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" />
        </div>
        <div>
          <Label htmlFor="cn-method">Preferred format</Label>
          <Select id="cn-method" name="method" defaultValue="any">
            <option value="any">No preference</option>
            <option value="video">Video call</option>
            <option value="phone">Phone call</option>
            <option value="in_person">In person</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="cn-topic" required>What would you like to discuss?</Label>
        <Input id="cn-topic" name="topic" required maxLength={300} defaultValue={defaultTopic} placeholder="e.g. Moving our school records online" />
        <FieldError>{(state.status === "error" ? state.fieldErrors?.topic : undefined)}</FieldError>
      </div>
      <div>
        <Label htmlFor="cn-window" required>Preferred date or time window</Label>
        <Input id="cn-window" name="preferredWindow" required maxLength={200} placeholder="e.g. Weekday afternoons next week, or 20 June after 15:00" />
        <FieldError>{(state.status === "error" ? state.fieldErrors?.preferredWindow : undefined)}</FieldError>
      </div>
      <div>
        <Label htmlFor="cn-msg">Anything else? <span className="font-normal text-mist-500">(optional)</span></Label>
        <Textarea id="cn-msg" name="message" maxLength={3000} rows={3} />
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : "Request consultation"}
        <Icon name="calendar" className="h-4 w-4" />
      </Button>
    </form>
  );
}
