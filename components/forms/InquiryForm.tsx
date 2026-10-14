"use client";

import { useMemo, useState } from "react";
import { postFormData, SubmitState } from "./shared";
import { Honeypot } from "./ContactForm";
import { Button, Hint, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SERVICES, BUDGET_RANGES, TIMELINES, ORG_TYPES } from "@/lib/constants";
import { classNames } from "@/lib/utils";

const STEPS = ["Service", "Project", "Preferences", "Contact", "Files", "Review"] as const;

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx";

export function InquiryForm({
  initialService,
  initialKind = "project",
}: {
  initialService?: string;
  initialKind?: "project" | "quotation";
}) {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<"project" | "quotation">(initialKind);
  const [services, setServices] = useState<string[]>(initialService ? [initialService] : []);
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [attempted, setAttempted] = useState(false);

  const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const stepErrors = useMemo((): string[] => {
    const errs: string[] = [];
    if (step === 0 && services.length === 0) errs.push("Select at least one service.");
    if (step === 1 && !values.title?.trim()) errs.push("Give your project a short title.");
    if (step === 3) {
      if (!values.name?.trim()) errs.push("Enter your name.");
      if (!values.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.push("Enter a valid email address.");
    }
    return errs;
  }, [step, services, values]);

  const toggleService = (slug: string) =>
    setServices((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const next = () => {
    setAttempted(true);
    if (stepErrors.length > 0) return;
    setAttempted(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => {
      const merged = [...prev];
      for (const f of Array.from(list)) {
        if (f.size > 8 * 1024 * 1024) continue;
        if (merged.length >= 5) break;
        merged.push(f);
      }
      return merged;
    });
  };

  async function submit() {
    setState({ status: "submitting" });
    const fd = new FormData();
    fd.set(
      "data",
      JSON.stringify({
        kind,
        services,
        title: values.title,
        problem: values.problem || undefined,
        description: values.description || undefined,
        deliverables: values.deliverables || undefined,
        requirements: values.requirements || undefined,
        budget: values.budget || undefined,
        timeline: values.timeline || undefined,
        orgType: values.orgType || undefined,
        consultMethod: values.consultMethod || undefined,
        name: values.name,
        organisation: values.organisation || undefined,
        email: values.email,
        phone: values.phone || undefined,
        preferredContact: values.preferredContact || undefined,
        website: values.website || "",
      }),
    );
    for (const f of files) fd.append("files", f);
    const result = await postFormData("/api/inquiries", fd);
    setState(result);
    if (result.status === "success") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <h2 className="font-display text-2xl font-bold text-emerald-900">
          {kind === "quotation" ? "Quotation request received" : "Project inquiry received"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-800">
          Thank you, {values.name.split(" ")[0]}. Our team will review your{" "}
          {kind === "quotation" ? "request" : "project"} and respond using your preferred contact method.
        </p>
        {state.reference ? (
          <p className="mt-4 inline-block rounded-xl bg-white px-5 py-3 font-mono text-lg font-bold tracking-wider text-navy-900 ring-1 ring-emerald-200">
            {state.reference}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-emerald-700">Keep this reference for your records.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Honeypot />
      {/* progress */}
      <ol className="mb-8 flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Form progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={classNames(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                i === step
                  ? "bg-electric-600 text-white"
                  : i < step
                    ? "bg-electric-100 text-electric-700 hover:bg-electric-200"
                    : "bg-mist-100 text-mist-500",
              )}
            >
              <span
                className={classNames(
                  "flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-full text-[10px]",
                  i === step ? "bg-white/20" : i < step ? "bg-electric-200" : "bg-mist-200",
                )}
              >
                {i < step ? <Icon name="check" className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 ? <span className="h-px w-3 bg-mist-300 sm:w-5" aria-hidden /> : null}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card sm:p-8">
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-xl font-bold text-navy-900">What do you need help with?</legend>
            <p className="mt-1 text-sm text-mist-600">Select one or more services — you can refine the details later.</p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <label
                  key={s.slug}
                  className={classNames(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all",
                    services.includes(s.slug)
                      ? "border-electric-500 bg-electric-50 ring-1 ring-electric-500"
                      : "border-mist-200 hover:border-electric-300 hover:bg-mist-50",
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-electric-600"
                    checked={services.includes(s.slug)}
                    onChange={() => toggleService(s.slug)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy-900">{s.shortName}</span>
                    <span className="block text-xs leading-snug text-mist-500">{s.tagline}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6">
              <Label>I would like to…</Label>
              <div className="mt-1.5 flex gap-2.5">
                {(
                  [
                    ["project", "Start a project"],
                    ["quotation", "Get a quotation"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(value)}
                    aria-pressed={kind === value}
                    className={classNames(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none",
                      kind === value
                        ? "border-electric-600 bg-electric-600 text-white"
                        : "border-mist-300 text-mist-600 hover:border-electric-400",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-navy-900">Describe the project</h2>
            <div>
              <Label htmlFor="iq-title" required>Project title</Label>
              <Input id="iq-title" value={values.title ?? ""} onChange={(e) => set("title", e.target.value)} maxLength={300} placeholder="e.g. Online shop for a family business" />
            </div>
            <div>
              <Label htmlFor="iq-problem">What problem are you trying to solve?</Label>
              <Textarea id="iq-problem" value={values.problem ?? ""} onChange={(e) => set("problem", e.target.value)} maxLength={3000} rows={3} />
            </div>
            <div>
              <Label htmlFor="iq-desc">Project description</Label>
              <Textarea id="iq-desc" value={values.description ?? ""} onChange={(e) => set("description", e.target.value)} maxLength={6000} rows={5} placeholder="Describe what you have in mind, who it is for, and anything else that helps us understand the work." />
            </div>
            <div>
              <Label htmlFor="iq-deliverables">Expected deliverables</Label>
              <Textarea id="iq-deliverables" value={values.deliverables ?? ""} onChange={(e) => set("deliverables", e.target.value)} maxLength={3000} rows={3} placeholder="e.g. website, admin dashboard, training session…" />
            </div>
            <div>
              <Label htmlFor="iq-reqs">Additional requirements <span className="font-normal text-mist-500">(optional)</span></Label>
              <Textarea id="iq-reqs" value={values.requirements ?? ""} onChange={(e) => set("requirements", e.target.value)} maxLength={3000} rows={2} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-navy-900">Your preferences</h2>
            <p className="text-sm text-mist-600">All of these are optional — share only what you know today.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="iq-budget">Approximate budget range</Label>
                <Select id="iq-budget" value={values.budget ?? ""} onChange={(e) => set("budget", e.target.value)}>
                  <option value="">Prefer not to say</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="iq-timeline">Preferred timeline</Label>
                <Select id="iq-timeline" value={values.timeline ?? ""} onChange={(e) => set("timeline", e.target.value)}>
                  <option value="">Not sure yet</option>
                  {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="iq-orgtype">Organisation type</Label>
                <Select id="iq-orgtype" value={values.orgType ?? ""} onChange={(e) => set("orgType", e.target.value)}>
                  <option value="">Select…</option>
                  {ORG_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="iq-consult">Preferred consultation method</Label>
                <Select id="iq-consult" value={values.consultMethod ?? ""} onChange={(e) => set("consultMethod", e.target.value)}>
                  <option value="">No preference</option>
                  <option value="video">Video call</option>
                  <option value="phone">Phone call</option>
                  <option value="in_person">In person</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-navy-900">Your contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="iq-name" required>Full name</Label>
                <Input id="iq-name" value={values.name ?? ""} onChange={(e) => set("name", e.target.value)} maxLength={200} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="iq-org">Organisation <span className="font-normal text-mist-500">(if applicable)</span></Label>
                <Input id="iq-org" value={values.organisation ?? ""} onChange={(e) => set("organisation", e.target.value)} maxLength={200} autoComplete="organization" />
              </div>
              <div>
                <Label htmlFor="iq-email" required>Email</Label>
                <Input id="iq-email" type="email" value={values.email ?? ""} onChange={(e) => set("email", e.target.value)} maxLength={320} autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="iq-phone">Telephone / WhatsApp <span className="font-normal text-mist-500">(optional)</span></Label>
                <Input id="iq-phone" type="tel" value={values.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} autoComplete="tel" />
              </div>
              <div>
                <Label htmlFor="iq-pref">Preferred contact method</Label>
                <Select id="iq-pref" value={values.preferredContact ?? "email"} onChange={(e) => set("preferredContact", e.target.value)}>
                  <option value="email">Email</option>
                  <option value="phone">Phone call</option>
                  <option value="whatsapp">WhatsApp</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">Supporting files <span className="font-normal text-mist-500">(optional)</span></h2>
            <p className="mt-1 text-sm text-mist-600">Briefs, sketches, screenshots — anything that helps us understand the work.</p>
            <label
              htmlFor="iq-files"
              className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-mist-300 bg-mist-50 px-6 py-10 text-center transition-colors hover:border-electric-400 hover:bg-electric-50/50"
            >
              <Icon name="download" className="h-8 w-8 rotate-180 text-mist-400" />
              <span className="mt-3 text-sm font-semibold text-navy-900">Choose files to attach</span>
              <span className="mt-1 text-xs text-mist-500">PDF, Word, images or text · up to 5 files · 8 MB each</span>
              <input id="iq-files" type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </label>
            {files.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl bg-mist-100 px-4 py-2.5 text-sm">
                    <span className="flex items-center gap-2.5 text-navy-900">
                      <Icon name="file-text" className="h-4 w-4 text-electric-600" />
                      <span className="max-w-[240px] truncate sm:max-w-md">{f.name}</span>
                      <span className="text-xs text-mist-500">{(f.size / 1024).toFixed(0)} KB</span>
                    </span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-mist-500 hover:bg-white hover:text-red-600" aria-label={`Remove ${f.name}`}>
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <Hint>Files are scanned and stored privately. They are only visible to our team.</Hint>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">Review & submit</h2>
            <p className="mt-1 text-sm text-mist-600">Check your details before submitting. You can go back to edit any step.</p>
            <dl className="mt-6 space-y-5">
              <ReviewRow label="Request type" value={kind === "quotation" ? "Quotation request" : "Project inquiry"} onEdit={() => setStep(0)} />
              <ReviewRow label="Services" value={services.map((s) => SERVICES.find((x) => x.slug === s)?.shortName ?? s).join(", ")} onEdit={() => setStep(0)} />
              <ReviewRow label="Project title" value={values.title} onEdit={() => setStep(1)} />
              {values.problem ? <ReviewRow label="Problem to solve" value={values.problem} onEdit={() => setStep(1)} /> : null}
              {values.description ? <ReviewRow label="Description" value={values.description} onEdit={() => setStep(1)} /> : null}
              {values.deliverables ? <ReviewRow label="Deliverables" value={values.deliverables} onEdit={() => setStep(1)} /> : null}
              {values.budget ? <ReviewRow label="Budget" value={values.budget} onEdit={() => setStep(2)} /> : null}
              {values.timeline ? <ReviewRow label="Timeline" value={values.timeline} onEdit={() => setStep(2)} /> : null}
              <ReviewRow label="Name" value={values.name} onEdit={() => setStep(3)} />
              {values.organisation ? <ReviewRow label="Organisation" value={values.organisation} onEdit={() => setStep(3)} /> : null}
              <ReviewRow label="Email" value={values.email} onEdit={() => setStep(3)} />
              {values.phone ? <ReviewRow label="Phone" value={values.phone} onEdit={() => setStep(3)} /> : null}
              {files.length > 0 ? <ReviewRow label="Attachments" value={files.map((f) => f.name).join(", ")} onEdit={() => setStep(4)} /> : null}
            </dl>
            <p className="mt-6 rounded-xl bg-mist-50 p-4 text-xs leading-relaxed text-mist-600">
              By submitting, you agree that Fresh Solutions may use these details to respond to your request, as
              described in our Privacy Policy. We never sell your information.
            </p>
            {state.status === "error" && state.message ? (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</p>
            ) : null}
          </div>
        )}

        {attempted && stepErrors.length > 0 ? (
          <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {stepErrors.map((e) => <p key={e}>• {e}</p>)}
          </div>
        ) : null}

        {/* nav */}
        <div className="mt-8 flex items-center justify-between border-t border-mist-200 pt-6">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <Icon name="arrow-left" className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Continue <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={state.status === "submitting"}>
              {state.status === "submitting" ? "Submitting…" : "Submit request"}
              <Icon name="send" className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value?: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-mist-50 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">{label}</dt>
        <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-navy-900">{value || "—"}</dd>
      </div>
      <button type="button" onClick={onEdit} className="shrink-0 rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-white hover:text-electric-600" aria-label={`Edit ${label}`}>
        <Icon name="edit" className="h-4 w-4" />
      </button>
    </div>
  );
}
