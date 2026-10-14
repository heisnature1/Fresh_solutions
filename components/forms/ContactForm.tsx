"use client";

import { useState } from "react";
import { postJson, SubmitState } from "./shared";
import { Button, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

/** Hidden honeypot field — invisible to humans, attractive to bots. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
      <label>
        Website
        <input type="text" name="website" autoComplete="off" tabIndex={-1} />
      </label>
    </div>
  );
}

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "submitting" });
    const data = new FormData(e.currentTarget);
    const result = await postJson("/api/contact", {
      kind: "contact",
      name: data.get("name"),
      organisation: data.get("organisation") || undefined,
      email: data.get("email"),
      phone: data.get("phone") || undefined,
      preferredContact: data.get("preferredContact") || undefined,
      subject: data.get("subject"),
      message: data.get("message"),
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
        <h3 className="font-display text-lg font-semibold text-emerald-900">Message received</h3>
        <p className="mt-1.5 text-sm text-emerald-800">
          Thank you — we will get back to you using your preferred contact method.
          {state.reference ? (
            <>
              {" "}Your reference is <strong className="font-mono">{state.reference}</strong>.
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => setState({ status: "idle" })}
          className="mt-4 text-sm font-semibold text-emerald-700 underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form key={formKey} onSubmit={onSubmit} className="relative space-y-4" noValidate={false}>
      <Honeypot />
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <Label htmlFor="cf-name" required>Full name</Label>
          <Input id="cf-name" name="name" required maxLength={200} autoComplete="name" />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.name : undefined)}</FieldError>
        </div>
        <div>
          <Label htmlFor="cf-org">Organisation <span className="font-normal text-mist-500">(optional)</span></Label>
          <Input id="cf-org" name="organisation" maxLength={200} autoComplete="organization" />
        </div>
        <div>
          <Label htmlFor="cf-email" required>Email</Label>
          <Input id="cf-email" name="email" type="email" required maxLength={320} autoComplete="email" />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.email : undefined)}</FieldError>
        </div>
        <div>
          <Label htmlFor="cf-phone">Telephone <span className="font-normal text-mist-500">(optional)</span></Label>
          <Input id="cf-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.phone : undefined)}</FieldError>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-subject" required>Subject</Label>
          <Input id="cf-subject" name="subject" required maxLength={300} />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.subject : undefined)}</FieldError>
        </div>
        <div>
          <Label htmlFor="cf-pref">Preferred contact method</Label>
          <Select id="cf-pref" name="preferredContact" defaultValue="email">
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="whatsapp">WhatsApp</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="cf-message" required>Message</Label>
        <Textarea id="cf-message" name="message" required maxLength={5000} rows={compact ? 4 : 6} />
        <FieldError>{(state.status === "error" ? state.fieldErrors?.message : undefined)}</FieldError>
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={state.status === "submitting"} className="w-full sm:w-auto">
        {state.status === "submitting" ? "Sending…" : "Send message"}
        <Icon name="send" className="h-4 w-4" />
      </Button>
    </form>
  );
}
