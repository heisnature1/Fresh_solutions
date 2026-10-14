"use client";

import { useState } from "react";
import { postFormData, SubmitState } from "./shared";
import { Honeypot } from "./ContactForm";
import { Button, FieldError, Hint, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { APPLIANCE_CATEGORIES } from "@/lib/constants";

export function RepairRequestForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [category, setCategory] = useState("mobile_phone");
  const [photos, setPhotos] = useState<File[]>([]);

  const addPhotos = (list: FileList | null) => {
    if (!list) return;
    setPhotos((prev) => {
      const merged = [...prev];
      for (const f of Array.from(list)) {
        if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) continue;
        if (merged.length >= 4) break;
        merged.push(f);
      }
      return merged;
    });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "submitting" });
    const form = e.currentTarget;
    const data = new FormData(form);
    const fd = new FormData();
    fd.set(
      "data",
      JSON.stringify({
        customerName: data.get("customerName"),
        phone: data.get("phone"),
        email: data.get("email") || undefined,
        preferredContact: data.get("preferredContact") || undefined,
        applianceCategory: data.get("applianceCategory"),
        applianceType: data.get("applianceType"),
        brand: data.get("brand") || undefined,
        model: data.get("model") || undefined,
        faultDescription: data.get("faultDescription"),
        faultStarted: data.get("faultStarted") || undefined,
        powersOn: data.get("powersOn") || undefined,
        preferredDate: data.get("preferredDate") || undefined,
        additionalInfo: data.get("additionalInfo") || undefined,
        website: data.get("website") || "",
      }),
    );
    for (const p of photos) fd.append("photos", p);
    const result = await postFormData("/api/repairs", fd);
    setState(result);
    if (result.status === "success") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <h2 className="font-display text-2xl font-bold text-emerald-900">Repair request received</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-emerald-800">
          Our team will review your request and contact you to arrange assessment. Diagnosis, parts availability,
          repairability, and final pricing can only be confirmed after inspection.
        </p>
        <div className="mx-auto mt-6 grid max-w-sm gap-3 text-left">
          <div className="rounded-xl bg-white px-5 py-4 ring-1 ring-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Repair reference</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wider text-navy-900">{state.reference}</p>
          </div>
          <div className="rounded-xl bg-white px-5 py-4 ring-1 ring-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Status access code</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wider text-navy-900">{state.data?.accessCode ? String(state.data.accessCode) : ""}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-mist-600">
              Shown once. You need both the reference and this code to check your repair status online.
            </p>
          </div>
        </div>
        <a
          href="/repairs/track"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          Track this repair <Icon name="arrow-right" className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-6" encType="multipart/form-data">
      <Honeypot />
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-bold text-navy-900">About the appliance</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rr-cat" required>Appliance category</Label>
            <Select id="rr-cat" name="applianceCategory" required value={category} onChange={(e) => setCategory(e.target.value)}>
              {APPLIANCE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="rr-type" required>Appliance type</Label>
            <Input
              id="rr-type"
              name="applianceType"
              required
              maxLength={120}
              placeholder={category === "other" ? "e.g. microwave oven, standing fan, decoder…" : "e.g. smartphone, laptop, electric kettle"}
            />
            <FieldError>{(state.status === "error" ? state.fieldErrors?.applianceType : undefined)}</FieldError>
          </div>
          <div>
            <Label htmlFor="rr-brand">Brand</Label>
            <Input id="rr-brand" name="brand" maxLength={120} placeholder="e.g. Samsung, HP, Binatone" />
          </div>
          <div>
            <Label htmlFor="rr-model">Model <span className="font-normal text-mist-500">(if known)</span></Label>
            <Input id="rr-model" name="model" maxLength={120} />
          </div>
        </div>
        <div>
          <Label htmlFor="rr-fault" required>What is wrong with it?</Label>
          <Textarea
            id="rr-fault"
            name="faultDescription"
            required
            maxLength={5000}
            rows={4}
            placeholder="Describe the fault in your own words — what happens, when it started, anything you noticed."
          />
          <FieldError>{(state.status === "error" ? state.fieldErrors?.faultDescription : undefined)}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="rr-started">Fault started <span className="font-normal text-mist-500">(approx.)</span></Label>
            <Input id="rr-started" name="faultStarted" maxLength={60} placeholder="e.g. last week" />
          </div>
          <div>
            <Label htmlFor="rr-power">Does it power on?</Label>
            <Select id="rr-power" name="powersOn" defaultValue="unknown">
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unknown">Not sure</option>
              <option value="na">Not applicable</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="rr-date">Preferred service date <span className="font-normal text-mist-500">(optional)</span></Label>
            <Input id="rr-date" name="preferredDate" maxLength={60} placeholder="e.g. Saturday morning" />
          </div>
        </div>
        <div>
          <Label htmlFor="rr-photos">Photos of the fault <span className="font-normal text-mist-500">(optional, up to 4)</span></Label>
          <input
            id="rr-photos"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="mt-1.5 block w-full text-sm text-mist-600 file:mr-4 file:rounded-xl file:border-0 file:bg-electric-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-electric-700 hover:file:bg-electric-100"
            onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }}
          />
          {photos.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {photos.map((p, i) => (
                <li key={i} className="relative overflow-hidden rounded-xl ring-1 ring-mist-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(p)} alt={`Selected photo ${i + 1}`} className="h-20 w-full object-cover" />
                  <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-lg bg-navy-900/80 p-1 text-white" aria-label={`Remove photo ${i + 1}`}>
                    <Icon name="x" className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <Hint>Photos are stored privately and only seen by our repair team. Maximum 5 MB each.</Hint>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-bold text-navy-900">About you</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rr-name" required>Full name</Label>
            <Input id="rr-name" name="customerName" required maxLength={200} autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="rr-phone" required>Telephone number</Label>
            <Input id="rr-phone" name="phone" type="tel" required maxLength={40} autoComplete="tel" />
            <FieldError>{(state.status === "error" ? state.fieldErrors?.phone : undefined)}</FieldError>
          </div>
          <div>
            <Label htmlFor="rr-email">Email <span className="font-normal text-mist-500">(optional)</span></Label>
            <Input id="rr-email" name="email" type="email" maxLength={320} autoComplete="email" />
            <FieldError>{(state.status === "error" ? state.fieldErrors?.email : undefined)}</FieldError>
          </div>
          <div>
            <Label htmlFor="rr-pref">Preferred contact method</Label>
            <Select id="rr-pref" name="preferredContact" defaultValue="phone">
              <option value="phone">Phone call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="rr-extra">Anything else we should know? <span className="font-normal text-mist-500">(optional)</span></Label>
          <Textarea id="rr-extra" name="additionalInfo" maxLength={3000} rows={3} />
        </div>
      </fieldset>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-900">
        <p className="flex gap-2">
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Safety first:</strong> never open a mains-powered appliance yourself. Unplug it and let
            qualified people inspect it. We will confirm whether your appliance can be repaired, what it will cost,
            and how long it will take only <em>after</em> assessment — no repair price or completion date is
            promised before diagnosis.
          </span>
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={state.status === "submitting"} className="w-full sm:w-auto">
        {state.status === "submitting" ? "Submitting…" : "Submit repair request"}
        <Icon name="send" className="h-4 w-4" />
      </Button>
    </form>
  );
}
