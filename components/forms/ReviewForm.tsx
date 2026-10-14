"use client";

import { useState } from "react";
import { postJson, SubmitState } from "./shared";
import { Honeypot } from "./ContactForm";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { classNames } from "@/lib/utils";

export function ReviewForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [rating, setRating] = useState(0);
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "submitting" });
    const data = new FormData(e.currentTarget);
    const result = await postJson("/api/reviews", {
      name: data.get("name"),
      organisation: data.get("organisation") || undefined,
      role: data.get("role") || undefined,
      content: data.get("content"),
      rating: rating || undefined,
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
        <h3 className="font-display text-lg font-semibold text-emerald-900">Thank you for your feedback</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-emerald-800">
          Your review will only be published after our team reviews it and confirms your consent — we never publish
          feedback without approval.
        </p>
      </div>
    );
  }

  return (
    <form key={formKey} onSubmit={onSubmit} className="relative space-y-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rv-name" required>Your name</Label>
          <Input id="rv-name" name="name" required maxLength={200} autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="rv-org">Organisation <span className="font-normal text-mist-500">(optional)</span></Label>
          <Input id="rv-org" name="organisation" maxLength={200} autoComplete="organization" />
        </div>
      </div>
      <div>
        <Label htmlFor="rv-role">Your role <span className="font-normal text-mist-500">(optional)</span></Label>
        <Input id="rv-role" name="role" maxLength={200} placeholder="e.g. Operations Manager" />
      </div>
      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-navy-900">Rating <span className="font-normal text-mist-500">(optional)</span></legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(rating === n ? 0 : n)}
              className={classNames("rounded-lg p-1.5 transition-colors", n <= rating ? "text-amber-400" : "text-mist-300 hover:text-amber-300")}
            >
              <Icon name="star" className="h-6 w-6" />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <Label htmlFor="rv-content" required>Your review</Label>
        <Textarea id="rv-content" name="content" required maxLength={1500} rows={4} placeholder="What did we help you with, and how did it go?" />
      </div>
      <p className="text-xs leading-relaxed text-mist-500">
        Reviews are moderated. Nothing is published without review and your consent.
      </p>
      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : "Submit feedback"}
      </Button>
    </form>
  );
}
