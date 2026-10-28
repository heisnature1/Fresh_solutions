"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { InfoCard } from "@/components/admin/ui";
import { apiCall, ErrorBanner, NoticeBanner, useBusy } from "@/components/admin/client-utils";
import { Tilt } from "@/components/site/Tilt";
import { PricingStudioHeader } from "@/components/admin/PricingStudioHeader";
import { classNames } from "@/lib/utils";
import {
  ALL_PAGE_COPY_KEYS,
  DEFAULT_PRICING_CONFIG,
  DEFAULT_PRICING_PAGE_COPY,
  humanizeCopyKey,
  MULTILINE_COPY_KEYS,
  PAGE_COPY_GROUPS,
  PRICING_UNIT_OPTIONS,
  repairPricingConfig,
  serviceDisplayName,
  slugifyPricingId,
  validatePricingConfig,
  type PricingConfig,
  type PricingConfigIssue,
} from "@/lib/pricing-config";

type TabId = "general" | "prices" | "content" | "policies" | "advanced";

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: "general", label: "General", icon: "settings" },
  { id: "prices", label: "Services & prices", icon: "tag" },
  { id: "content", label: "Page copy", icon: "edit" },
  { id: "policies", label: "Rules & policies", icon: "file-text" },
  { id: "advanced", label: "JSON / import", icon: "code" },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function slugify(value: string): string {
  return slugifyPricingId(value);
}

function uniqueId(base: string, existing: Iterable<string>): string {
  const taken = new Set(existing);
  const root = slugify(base) || "item";
  if (!taken.has(root)) return root;
  let index = 2;
  while (taken.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

function isConfigWrapper(value: unknown): value is { config: unknown } {
  return value !== null && typeof value === "object" && !Array.isArray(value) && "config" in value;
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-xs leading-relaxed text-mist-500">{hint}</p> : null}
    </div>
  );
}

function EditorCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tilt intensity={4} className="h-full">
      <div data-reveal className={classNames("h-full rounded-2xl border border-mist-200 bg-white p-5 shadow-card", className)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
            {description ? <p className="mt-1 text-xs leading-relaxed text-mist-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </Tilt>
  );
}

function RemoveButton({ onClick, label = "Remove", disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} disabled={disabled} className="text-red-600 hover:bg-red-50">
      <Icon name="trash" className="h-4 w-4" /> {label}
    </Button>
  );
}

export function PricingManager({
  initialConfig,
  isCustom,
  updatedAt,
}: {
  initialConfig: PricingConfig;
  isCustom: boolean;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const { busy, error, notice, run, setError, setNotice } = useBusy();
  const [tab, setTab] = useState<TabId>("general");
  const [config, setConfig] = useState<PricingConfig>(() => clone(initialConfig));
  const [dirty, setDirty] = useState(false);
  const [issues, setIssues] = useState<PricingConfigIssue[]>([]);
  const [autoRepairs, setAutoRepairs] = useState<string[]>([]);
  const [copySearch, setCopySearch] = useState("");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initialConfig, null, 2));
  const [jsonEdited, setJsonEdited] = useState(false);
  const [jsonMessage, setJsonMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dirty && !jsonEdited) {
      setConfig(clone(initialConfig));
      setJsonText(JSON.stringify(initialConfig, null, 2));
      setJsonEdited(false);
    }
  }, [initialConfig, dirty, jsonEdited]);

  useEffect(() => {
    if (!dirty && !jsonEdited) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, jsonEdited]);

  function update(mutator: (draft: PricingConfig) => void) {
    setConfig((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });
    setDirty(true);
    setIssues([]);
    setAutoRepairs([]);
    setError(null);
    setNotice(null);
    setJsonMessage(null);
  }

  function changeTab(next: TabId) {
    if (next === "advanced" && !jsonEdited) {
      setJsonText(JSON.stringify(config, null, 2));
    }
    setTab(next);
  }

  // -------------------------------------------------------------------------
  // Update helpers
  // -------------------------------------------------------------------------

  function setStandardField(key: keyof PricingConfig["standard"], value: string | number) {
    update((draft) => {
      (draft.standard as unknown as Record<string, string | number>)[key] = value;
    });
  }

  function setPageCopy(key: string, value: string) {
    update((draft) => {
      draft.page[key] = value;
    });
  }

  function patchGroup(index: number, patch: Partial<PricingConfig["groups"][number]>) {
    update((draft) => Object.assign(draft.groups[index], patch));
  }

  function patchService(index: number, patch: Partial<PricingConfig["services"][number]>) {
    update((draft) => Object.assign(draft.services[index], patch));
  }

  function patchPlan(serviceIndex: number, planIndex: number, patch: Partial<PricingConfig["services"][number]["plans"][number]>) {
    update((draft) => {
      const service = draft.services[serviceIndex];
      const plan = service.plans[planIndex];
      const oldId = plan.id;
      Object.assign(plan, patch);
      if (patch.id && service.startingPlanId === oldId) service.startingPlanId = patch.id;
    });
  }

  function patchAddOn(serviceIndex: number, addOnIndex: number, patch: Partial<PricingConfig["services"][number]["addOns"][number]>) {
    update((draft) => Object.assign(draft.services[serviceIndex].addOns[addOnIndex], patch));
  }

  function patchRule(index: number, patch: Partial<PricingConfig["rules"][number]>) {
    update((draft) => Object.assign(draft.rules[index], patch));
  }

  function patchFaq(index: number, patch: Partial<PricingConfig["faqs"][number]>) {
    update((draft) => Object.assign(draft.faqs[index], patch));
  }

  function patchProcessStep(index: number, patch: Partial<PricingConfig["process"][number]>) {
    update((draft) => Object.assign(draft.process[index], patch));
  }

  function setPaymentTerm(index: number, value: string) {
    update((draft) => {
      draft.paymentTerms[index] = value;
    });
  }

  function setGroupId(index: number, nextId: string) {
    update((draft) => {
      const oldId = draft.groups[index].id;
      draft.groups[index].id = nextId;
      for (const service of draft.services) {
        if (service.groupId === oldId) service.groupId = nextId;
      }
    });
  }

  function setServiceSlug(index: number, nextSlug: string) {
    update((draft) => {
      const service = draft.services[index];
      service.serviceSlug = nextSlug;
      for (const plan of service.plans) plan.serviceSlug = nextSlug;
    });
  }

  function addGroup() {
    update((draft) => {
      const id = uniqueId("new-group", draft.groups.map((group) => group.id));
      draft.groups.push({ id, label: "New pricing group", shortLabel: "New", description: "Describe this group." });
    });
  }

  function removeGroup(index: number) {
    if (config.groups.length <= 1) {
      setError("At least one pricing group is required.");
      return;
    }
    if (!window.confirm("Remove this group? Its services will be moved to the first remaining group.")) return;
    update((draft) => {
      const removed = draft.groups[index].id;
      const fallback = draft.groups.find((_, i) => i !== index)?.id ?? draft.groups[0].id;
      draft.groups.splice(index, 1);
      for (const service of draft.services) {
        if (service.groupId === removed) service.groupId = fallback;
      }
    });
  }

  function addService() {
    update((draft) => {
      const slug = uniqueId("custom-service", draft.services.map((entry) => entry.serviceSlug));
      const planId = uniqueId(`${slug}-package`, draft.services.flatMap((entry) => entry.plans.map((plan) => plan.id)));
      draft.services.push({
        serviceSlug: slug,
        groupId: draft.groups[0]?.id ?? "digital",
        name: "New service",
        shortName: "New service",
        icon: "layers",
        detailsHref: "",
        actionHref: "",
        actionLabel: "",
        startingPlanId: planId,
        intro: "Describe what this service covers.",
        note: "List exclusions or common extras here.",
        addOns: [],
        plans: [
          {
            id: planId,
            serviceSlug: slug,
            name: "New package",
            summary: "Describe the package.",
            price: 0,
            unit: "one-time",
            kind: "fixed",
            duration: "To be agreed",
            bestFor: "Describe the ideal customer.",
            includes: ["One clear deliverable"],
            featured: false,
          },
        ],
      });
    });
  }

  function removeService(index: number) {
    if (config.services.length <= 1) {
      setError("At least one service is required.");
      return;
    }
    if (!window.confirm("Remove this service and all of its packages and extras?")) return;
    update((draft) => {
      draft.services.splice(index, 1);
    });
  }

  function addPlan(serviceIndex: number) {
    update((draft) => {
      const service = draft.services[serviceIndex];
      const id = uniqueId(`${service.serviceSlug}-package`, draft.services.flatMap((entry) => entry.plans.map((plan) => plan.id)));
      service.plans.push({
        id,
        serviceSlug: service.serviceSlug,
        name: "New package",
        summary: "Describe the package.",
        price: 0,
        unit: "one-time",
        kind: "fixed",
        duration: "To be agreed",
        bestFor: "Describe the ideal customer.",
        includes: ["One clear deliverable"],
        featured: false,
      });
    });
  }

  function removePlan(serviceIndex: number, planIndex: number) {
    const service = config.services[serviceIndex];
    if (service.plans.length <= 1) {
      setError("Each service needs at least one package.");
      return;
    }
    update((draft) => {
      const target = draft.services[serviceIndex];
      const removed = target.plans[planIndex];
      target.plans.splice(planIndex, 1);
      if (target.startingPlanId === removed.id) target.startingPlanId = target.plans[0]?.id;
    });
  }

  function addAddOn(serviceIndex: number) {
    update((draft) => {
      draft.services[serviceIndex].addOns.push({ label: "New extra", price: 0, unit: "one-time", note: "" });
    });
  }

  function removeAddOn(serviceIndex: number, addOnIndex: number) {
    update((draft) => {
      draft.services[serviceIndex].addOns.splice(addOnIndex, 1);
    });
  }

  function addRule() {
    update((draft) => {
      draft.rules.push({ icon: "check", title: "New pricing rule", description: "Explain how quotes work." });
    });
  }

  function removeRule(index: number) {
    update((draft) => {
      draft.rules.splice(index, 1);
    });
  }

  function addPaymentTerm() {
    update((draft) => {
      draft.paymentTerms.push("New payment term.");
    });
  }

  function removePaymentTerm(index: number) {
    update((draft) => {
      draft.paymentTerms.splice(index, 1);
    });
  }

  function addFaq() {
    update((draft) => {
      draft.faqs.push({ question: "New question?", answer: "Answer it clearly." });
    });
  }

  function removeFaq(index: number) {
    update((draft) => draft.faqs.splice(index, 1));
  }

  function addProcessStep() {
    update((draft) => {
      draft.process.push({ title: "New step", text: "Describe what happens." });
    });
  }

  function removeProcessStep(index: number) {
    update((draft) => draft.process.splice(index, 1));
  }

  function resetCopyGroup(keys: string[]) {
    update((draft) => {
      for (const key of keys) draft.page[key] = DEFAULT_PRICING_PAGE_COPY[key] ?? "";
    });
    setNotice("Section copy reset in the editor. Save to publish.");
  }

  // -------------------------------------------------------------------------
  // JSON helpers
  // -------------------------------------------------------------------------

  function updateJsonText(value: string) {
    setJsonText(value);
    setJsonEdited(true);
    setJsonMessage(null);
  }

  function loadJsonFromConfig() {
    setJsonText(JSON.stringify(config, null, 2));
    setJsonEdited(false);
    setJsonMessage("Loaded the current editor state.");
  }

  function formatJson() {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonMessage("JSON formatted. Apply it to the editor before publishing.");
    } catch {
      setJsonMessage("This is not valid JSON yet.");
    }
  }

  function applyJsonText(text: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setJsonMessage(`Invalid JSON: ${err instanceof Error ? err.message : "could not parse"}`);
      return false;
    }
    const raw = isConfigWrapper(parsed) ? parsed.config : parsed;
    const repaired = repairPricingConfig(raw);
    const result = validatePricingConfig(repaired.config);
    if (!result.ok) {
      setIssues(result.issues);
      setJsonMessage("The JSON is valid, but the pricing configuration is not. Fix the issues below.");
      return false;
    }
    setConfig(result.config);
    setAutoRepairs(repaired.repairs);
    setDirty(true);
    setIssues([]);
    setError(null);
    setJsonText(JSON.stringify(result.config, null, 2));
    setJsonEdited(false);
    setJsonMessage(
      repaired.repairs.length
        ? `JSON applied and ${repaired.repairs.length} ID/reference issue${repaired.repairs.length === 1 ? "" : "s"} repaired. Save to publish.`
        : "JSON applied to the editor. Save to publish.",
    );
    return true;
  }

  function applyJson() {
    applyJsonText(jsonText);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fresh-solutions-pricing.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function importJson(file?: File | null) {
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
    setJsonEdited(true);
    setTab("advanced");
    applyJsonText(text);
  }

  // -------------------------------------------------------------------------
  // Save / reset
  // -------------------------------------------------------------------------

  function repairCurrent(source: PricingConfig = config) {
    const repaired = repairPricingConfig(source);
    const validation = validatePricingConfig(repaired.config);
    setConfig(repaired.config);
    setDirty(true);
    setIssues(validation.ok ? [] : validation.issues);
    setAutoRepairs(repaired.repairs);
    setError(null);
    setNotice(
      repaired.repairs.length
        ? `Repaired ${repaired.repairs.length} ID/reference issue${repaired.repairs.length === 1 ? "" : "s"}. Review, then save.`
        : "No automatic ID fixes were needed.",
    );
    setJsonText(JSON.stringify(repaired.config, null, 2));
    setJsonEdited(false);
    setJsonMessage(
      repaired.repairs.length
        ? `Configuration repaired (${repaired.repairs.length} issue${repaired.repairs.length === 1 ? "" : "s"}). Review before saving.`
        : "Configuration checked. No ID repairs were needed.",
    );
    return repaired;
  }

  async function save() {
    if (jsonEdited) {
      setTab("advanced");
      setError("Apply your edited JSON to the editor before saving, or reload the editor JSON to discard it.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const repaired = repairPricingConfig(config);
    if (repaired.repairs.length > 0) {
      setConfig(repaired.config);
      setAutoRepairs(repaired.repairs);
    }
    const result = validatePricingConfig(repaired.config);
    if (!result.ok) {
      setIssues(result.issues);
      setError(`Please fix ${result.issues.length} validation issue${result.issues.length === 1 ? "" : "s"} before saving.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setConfig(result.config);
    const ok = await run(() => apiCall("/api/admin/pricing", "POST", { config: result.config }), {
      notice: repaired.repairs.length
        ? `Pricing saved. ${repaired.repairs.length} ID/reference issue${repaired.repairs.length === 1 ? "" : "s"} repaired automatically.`
        : "Pricing saved. The public site now uses these settings.",
      onSuccess: () => {
        setDirty(false);
        setIssues([]);
        setAutoRepairs([]);
        setJsonText(JSON.stringify(result.config, null, 2));
        setJsonEdited(false);
        router.refresh();
      },
    });
    if (!ok) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function resetDefaults() {
    if (!window.confirm("Reset pricing to the built-in defaults? This deletes the saved database override.")) return;
    const ok = await run(() => apiCall("/api/admin/pricing", "DELETE"), {
      notice: "Pricing reset to the built-in defaults.",
      onSuccess: () => {
        const fallback = clone(DEFAULT_PRICING_CONFIG);
        setConfig(fallback);
        setDirty(false);
        setIssues([]);
        setAutoRepairs([]);
        setJsonText(JSON.stringify(fallback, null, 2));
        setJsonEdited(false);
        router.refresh();
      },
    });
    if (!ok) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // -------------------------------------------------------------------------
  // Renderers
  // -------------------------------------------------------------------------

  function renderGeneral() {
    return (
      <div data-reveal="slide-left" className="grid gap-5 lg:grid-cols-2">
        <EditorCard title="Currency & display" description="These values appear on the public pricing page and in structured data.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Currency code" hint="Use GHS for Ghana cedis.">
              <Input value={config.currency} maxLength={3} onChange={(e) => update((draft) => { draft.currency = e.target.value.toUpperCase(); })} />
            </Field>
            <Field label="Currency label">
              <Input value={config.currencyLabel} onChange={(e) => update((draft) => { draft.currencyLabel = e.target.value; })} />
            </Field>
            <Field label="Symbol" hint="For example GH₵.">
              <Input value={config.symbol} onChange={(e) => update((draft) => { draft.symbol = e.target.value; })} />
            </Field>
            <Field label="Effective date" hint="YYYY-MM-DD">
              <Input type="date" value={config.standard.effectiveDate} onChange={(e) => setStandardField("effectiveDate", e.target.value)} />
            </Field>
          </div>
        </EditorCard>

        <EditorCard title="Commercial settings" description="Used in quotes, payment terms, revisions and the free intro call.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quote validity (days)">
              <Input type="number" min={1} value={config.standard.quoteValidityDays} onChange={(e) => setStandardField("quoteValidityDays", Number(e.target.value))} />
            </Field>
            <Field label="Review cycle">
              <Input value={config.standard.reviewCycle} onChange={(e) => setStandardField("reviewCycle", e.target.value)} />
            </Field>
            <Field label="Included revision rounds">
              <Input type="number" min={0} value={config.standard.includedRevisionRounds} onChange={(e) => setStandardField("includedRevisionRounds", Number(e.target.value))} />
            </Field>
            <Field label="Standard hourly rate">
              <Input type="number" min={0} value={config.standard.standardHourlyRate} onChange={(e) => setStandardField("standardHourlyRate", Number(e.target.value))} />
            </Field>
            <Field label="Deposit percent">
              <Input type="number" min={0} max={100} value={config.standard.depositPercent} onChange={(e) => setStandardField("depositPercent", Number(e.target.value))} />
            </Field>
            <Field label="Large project threshold">
              <Input type="number" min={0} value={config.standard.largeProjectThreshold} onChange={(e) => setStandardField("largeProjectThreshold", Number(e.target.value))} />
            </Field>
            <Field label="Free intro call (minutes)">
              <Input type="number" min={0} value={config.standard.freeIntroCallMinutes} onChange={(e) => setStandardField("freeIntroCallMinutes", Number(e.target.value))} />
            </Field>
          </div>
        </EditorCard>

        <Tilt intensity={4} className="lg:col-span-2">
          <div data-reveal className="h-full">
            <InfoCard title="Quick stats" className="h-full">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Groups", value: config.groups.length },
                  { label: "Services", value: config.services.length },
                  { label: "Packages", value: config.services.reduce((total, entry) => total + entry.plans.length, 0) },
                  { label: "Extras", value: config.services.reduce((total, entry) => total + entry.addOns.length, 0) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-mist-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">{stat.label}</p>
                    <p className="mt-1 font-display text-2xl font-bold text-navy-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        </Tilt>
      </div>
    );
  }

  function renderPlanEditor(serviceIndex: number, planIndex: number) {
    const plan = config.services[serviceIndex].plans[planIndex];
    return (
      <Tilt key={planIndex} intensity={3} className="h-full">
        <div data-reveal className="h-full">
          <Card className="border border-mist-200 bg-white p-4 shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-electric-600">Package {planIndex + 1}</p>
              <h5 className="mt-1 font-display text-base font-bold text-navy-900">{plan.name || "Untitled package"}</h5>
            </div>
            <RemoveButton label="Remove package" onClick={() => removePlan(serviceIndex, planIndex)} disabled={config.services[serviceIndex].plans.length <= 1} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Package ID" hint="Used in enquiry links; lowercase letters, numbers and hyphens. Invalid characters are fixed on blur.">
              <Input
                value={plan.id}
                onChange={(e) => patchPlan(serviceIndex, planIndex, { id: e.target.value })}
                onBlur={(e) => {
                  const clean = slugifyPricingId(e.target.value) || plan.id;
                  if (clean !== e.target.value) patchPlan(serviceIndex, planIndex, { id: clean });
                }}
              />
            </Field>
            <Field label="Name">
              <Input value={plan.name} onChange={(e) => patchPlan(serviceIndex, planIndex, { name: e.target.value })} />
            </Field>
            <Field label="Price" hint={`Whole ${config.currency}; no decimals.`}>
              <Input type="number" min={0} value={plan.price} onChange={(e) => patchPlan(serviceIndex, planIndex, { price: Number(e.target.value) })} />
            </Field>
            <Field label="Unit">
              <Input list="pricing-units" value={plan.unit} onChange={(e) => patchPlan(serviceIndex, planIndex, { unit: e.target.value })} />
            </Field>
            <Field label="Price kind">
              <Select value={plan.kind} onChange={(e) => patchPlan(serviceIndex, planIndex, { kind: e.target.value as "fixed" | "from" })}>
                <option value="fixed">Fixed price</option>
                <option value="from">Starting price (from)</option>
              </Select>
            </Field>
            <Field label="Duration">
              <Input value={plan.duration} onChange={(e) => patchPlan(serviceIndex, planIndex, { duration: e.target.value })} />
            </Field>
            <Field label="Best for">
              <Input value={plan.bestFor} onChange={(e) => patchPlan(serviceIndex, planIndex, { bestFor: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-navy-900">
              <input
                type="checkbox"
                checked={Boolean(plan.featured)}
                onChange={(e) => patchPlan(serviceIndex, planIndex, { featured: e.target.checked })}
                className="h-4 w-4 rounded border-mist-300 text-electric-600 focus:ring-electric-500"
              />
              Mark as popular
            </label>
            <Field label="Summary" hint="Shown on the pricing card.">
              <Textarea rows={3} value={plan.summary} onChange={(e) => patchPlan(serviceIndex, planIndex, { summary: e.target.value })} />
            </Field>
            <Field label="Inclusions" hint="One inclusion per line.">
              <Textarea rows={5} value={plan.includes.join("\n")} onChange={(e) => patchPlan(serviceIndex, planIndex, { includes: e.target.value.split("\n") })} />
          </Field>
            </div>
          </Card>
        </div>
      </Tilt>
    );
  }

  function renderAddOnEditor(serviceIndex: number, addOnIndex: number) {
    const addOn = config.services[serviceIndex].addOns[addOnIndex];
    return (
      <div key={addOnIndex} className="grid gap-3 rounded-xl border border-mist-200 bg-white p-3 sm:grid-cols-[1.5fr_0.7fr_1fr_1fr_auto] sm:items-end">
        <Field label="Extra label">
          <Input value={addOn.label} onChange={(e) => patchAddOn(serviceIndex, addOnIndex, { label: e.target.value })} />
        </Field>
        <Field label="Price">
          <Input type="number" min={0} value={addOn.price} onChange={(e) => patchAddOn(serviceIndex, addOnIndex, { price: Number(e.target.value) })} />
        </Field>
        <Field label="Unit">
          <Input list="pricing-units" value={addOn.unit} onChange={(e) => patchAddOn(serviceIndex, addOnIndex, { unit: e.target.value })} />
        </Field>
        <Field label="Note">
          <Input value={addOn.note ?? ""} onChange={(e) => patchAddOn(serviceIndex, addOnIndex, { note: e.target.value })} />
        </Field>
        <RemoveButton label="Remove" onClick={() => removeAddOn(serviceIndex, addOnIndex)} />
      </div>
    );
  }

  function renderServiceEditor(serviceIndex: number) {
    const entry = config.services[serviceIndex];
    const group = config.groups.find((item) => item.id === entry.groupId);
    const startingPlanId = entry.startingPlanId || entry.plans[0]?.id || "";
    return (
      <details key={serviceIndex} open={serviceIndex === 0} data-reveal className="group rounded-2xl border border-mist-200 bg-white p-4 shadow-card sm:p-5">
        <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-electric-600">{group?.label ?? entry.groupId}</p>
            <h4 className="mt-1 font-display text-lg font-bold text-navy-900">{serviceDisplayName(config, entry)}</h4>
            <p className="mt-1 text-xs text-mist-500">
              {entry.plans.length} package{entry.plans.length === 1 ? "" : "s"} · {entry.addOns.length} extra{entry.addOns.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">{config.symbol}{entry.plans[0]?.price ?? 0}+</Badge>
            <Icon name="chevron-down" className="h-4 w-4 text-mist-500 transition-transform group-open:rotate-180" />
          </div>
        </summary>

        <div className="mt-5 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Service slug" hint="Used in enquiry URLs. Changing it updates its packages too. Invalid characters are fixed on blur.">
              <Input
                value={entry.serviceSlug}
                onChange={(e) => setServiceSlug(serviceIndex, e.target.value)}
                onBlur={(e) => {
                  const clean = slugifyPricingId(e.target.value) || entry.serviceSlug;
                  if (clean !== e.target.value) setServiceSlug(serviceIndex, clean);
                }}
              />
            </Field>
            <Field label="Display name" hint="Leave blank to use the code service name.">
              <Input value={entry.name ?? ""} onChange={(e) => patchService(serviceIndex, { name: e.target.value })} />
            </Field>
            <Field label="Short name">
              <Input value={entry.shortName ?? ""} onChange={(e) => patchService(serviceIndex, { shortName: e.target.value })} />
            </Field>
            <Field label="Group">
              <Select value={entry.groupId} onChange={(e) => patchService(serviceIndex, { groupId: e.target.value })}>
                {config.groups.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                {!group ? <option value={entry.groupId}>{entry.groupId}</option> : null}
              </Select>
            </Field>
            <Field label="Icon" hint="An icon key such as code, shield or tool.">
              <Input value={entry.icon ?? ""} onChange={(e) => patchService(serviceIndex, { icon: e.target.value })} />
            </Field>
            <Field label="Starting package" hint="Shown in “from” badges and directory cards.">
              <Select value={startingPlanId} onChange={(e) => patchService(serviceIndex, { startingPlanId: e.target.value })}>
                {entry.plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </Select>
            </Field>
            <Field label="Service details URL" hint="Optional; defaults to the matching solutions page.">
              <Input value={entry.detailsHref ?? ""} onChange={(e) => patchService(serviceIndex, { detailsHref: e.target.value })} />
            </Field>
            <Field label="CTA label">
              <Input value={entry.actionLabel ?? ""} onChange={(e) => patchService(serviceIndex, { actionLabel: e.target.value })} />
            </Field>
            <Field label="CTA URL" hint="Optional; defaults to a prefilled start-a-project link.">
              <Input value={entry.actionHref ?? ""} onChange={(e) => patchService(serviceIndex, { actionHref: e.target.value })} />
            </Field>
            <Field label="Intro">
              <Textarea rows={3} value={entry.intro} onChange={(e) => patchService(serviceIndex, { intro: e.target.value })} />
            </Field>
            <Field label="Scope note">
              <Textarea rows={3} value={entry.note} onChange={(e) => patchService(serviceIndex, { note: e.target.value })} />
            </Field>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h5 className="font-display text-base font-bold text-navy-900">Packages</h5>
              <Button type="button" variant="outline" size="sm" onClick={() => addPlan(serviceIndex)}>
                <Icon name="plus" className="h-4 w-4" /> Add package
              </Button>
            </div>
            <div className="space-y-4">
              {entry.plans.map((_, planIndex) => renderPlanEditor(serviceIndex, planIndex))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h5 className="font-display text-base font-bold text-navy-900">Optional extras</h5>
              <Button type="button" variant="outline" size="sm" onClick={() => addAddOn(serviceIndex)}>
                <Icon name="plus" className="h-4 w-4" /> Add extra
              </Button>
            </div>
            {entry.addOns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-mist-300 bg-mist-50 p-4 text-sm text-mist-500">No extras for this service.</p>
            ) : (
              <div className="space-y-3">{entry.addOns.map((_, addOnIndex) => renderAddOnEditor(serviceIndex, addOnIndex))}</div>
            )}
          </div>

          <div className="flex justify-end border-t border-mist-200 pt-4">
            <RemoveButton label="Remove service" onClick={() => removeService(serviceIndex)} disabled={config.services.length <= 1} />
          </div>
        </div>
      </details>
    );
  }

  function renderPrices() {
    return (
      <div data-reveal="zoom" className="space-y-5">
        <datalist id="pricing-units">
          {PRICING_UNIT_OPTIONS.map((unit) => <option key={unit} value={unit} />)}
        </datalist>
        <EditorCard
          title="Services & packages"
          description="Edit names, summaries, prices, units, durations, best-for text, inclusions, featured flags, extras and CTAs."
          actions={
            <>
              <Button type="button" variant="outline" size="sm" onClick={addService}>
                <Icon name="plus" className="h-4 w-4" /> Add service
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Services", value: config.services.length },
              { label: "Packages", value: config.services.reduce((total, entry) => total + entry.plans.length, 0) },
              { label: "Extras", value: config.services.reduce((total, entry) => total + entry.addOns.length, 0) },
              { label: "Groups", value: config.groups.length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-mist-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">{stat.label}</p>
                <p className="mt-1 font-display text-xl font-bold text-navy-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </EditorCard>
        <div className="space-y-4">{config.services.map((_, index) => renderServiceEditor(index))}</div>
      </div>
    );
  }

  function renderContent() {
    const query = copySearch.trim().toLowerCase();
    const matches = (key: string) =>
      !query ||
      key.toLowerCase().includes(query) ||
      humanizeCopyKey(key).toLowerCase().includes(query) ||
      (config.page[key] ?? "").toLowerCase().includes(query);

    return (
      <div data-reveal="slide-right" className="space-y-5">
        <EditorCard title="All page copy" description={`${ALL_PAGE_COPY_KEYS.length} editable strings across the pricing page and its downstream links.`}>
          <Field label="Search copy" hint="Filter by key, label or current text.">
            <Input value={copySearch} onChange={(e) => setCopySearch(e.target.value)} placeholder="e.g. hero, estimate, SEO" />
          </Field>
        </EditorCard>

        {PAGE_COPY_GROUPS.map((group) => {
          const keys = group.keys.filter(matches);
          if (keys.length === 0) return null;
          return (
            <EditorCard
              key={group.id}
              title={group.label}
              description={`${keys.length} field${keys.length === 1 ? "" : "s"}`}
              actions={
                <Button type="button" variant="ghost" size="sm" onClick={() => resetCopyGroup(group.keys)}>
                  <Icon name="refresh" className="h-4 w-4" /> Reset section
                </Button>
              }
            >
              <div className="grid gap-5 lg:grid-cols-2">
                {keys.map((key) => {
                  const multiline = MULTILINE_COPY_KEYS.has(key);
                  const id = `copy-${key.replace(/\./g, "-")}`;
                  return (
                    <div key={key} className={multiline ? "lg:col-span-2" : ""}>
                      <Label htmlFor={id}>{humanizeCopyKey(key)}</Label>
                      {multiline ? (
                        <Textarea id={id} rows={3} value={config.page[key] ?? DEFAULT_PRICING_PAGE_COPY[key] ?? ""} onChange={(e) => setPageCopy(key, e.target.value)} />
                      ) : (
                        <Input id={id} value={config.page[key] ?? DEFAULT_PRICING_PAGE_COPY[key] ?? ""} onChange={(e) => setPageCopy(key, e.target.value)} />
                      )}
                      <p className="mt-1 font-mono text-[11px] text-mist-400">{key}</p>
                    </div>
                  );
                })}
              </div>
            </EditorCard>
          );
        })}
      </div>
    );
  }

  function renderPolicies() {
    return (
      <div data-reveal="flip" className="space-y-5">
        <EditorCard
          title="Pricing groups"
          description="Group IDs are used in page anchors. Changing an ID updates its services automatically."
          actions={<Button type="button" variant="outline" size="sm" onClick={addGroup}><Icon name="plus" className="h-4 w-4" /> Add group</Button>}
        >
          <div className="space-y-4">
            {config.groups.map((group, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-mist-200 bg-mist-50 p-4 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end">
                <Field label="Group ID">
                  <Input
                    value={group.id}
                    onChange={(e) => setGroupId(index, e.target.value)}
                    onBlur={(e) => {
                      const clean = slugifyPricingId(e.target.value) || group.id;
                      if (clean !== e.target.value) setGroupId(index, clean);
                    }}
                  />
                </Field>
                <Field label="Short label">
                  <Input value={group.shortLabel} onChange={(e) => patchGroup(index, { shortLabel: e.target.value })} />
                </Field>
                <Field label="Label">
                  <Input value={group.label} onChange={(e) => patchGroup(index, { label: e.target.value })} />
                </Field>
                <RemoveButton label="Remove" onClick={() => removeGroup(index)} disabled={config.groups.length <= 1} />
                <div className="sm:col-span-4">
                  <Field label="Description">
                    <Textarea rows={2} value={group.description} onChange={(e) => patchGroup(index, { description: e.target.value })} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </EditorCard>

        <EditorCard
          title="Pricing rules"
          description="Shown as the pricing-standard cards on /pricing."
          actions={<Button type="button" variant="outline" size="sm" onClick={addRule}><Icon name="plus" className="h-4 w-4" /> Add rule</Button>}
        >
          {config.rules.length === 0 ? <p className="text-sm text-mist-500">No rules yet.</p> : (
            <div className="space-y-4">
              {config.rules.map((rule, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-mist-200 bg-mist-50 p-4 sm:grid-cols-[0.5fr_1fr_2fr_auto] sm:items-end">
                  <Field label="Icon"><Input value={rule.icon} onChange={(e) => patchRule(index, { icon: e.target.value })} /></Field>
                  <Field label="Title"><Input value={rule.title} onChange={(e) => patchRule(index, { title: e.target.value })} /></Field>
                  <Field label="Description"><Textarea rows={2} value={rule.description} onChange={(e) => patchRule(index, { description: e.target.value })} /></Field>
                  <RemoveButton label="Remove" onClick={() => removeRule(index)} />
                </div>
              ))}
            </div>
          )}
        </EditorCard>

        <EditorCard
          title="Payment terms"
          description="Each term appears as a separate item on /pricing and in the pricing standard export."
          actions={<Button type="button" variant="outline" size="sm" onClick={addPaymentTerm}><Icon name="plus" className="h-4 w-4" /> Add term</Button>}
        >
          {config.paymentTerms.length === 0 ? <p className="text-sm text-mist-500">No payment terms yet.</p> : (
            <div className="space-y-3">
              {config.paymentTerms.map((term, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="mt-3 w-6 shrink-0 text-xs font-bold text-mist-500">{index + 1}.</span>
                  <Textarea rows={2} value={term} onChange={(e) => setPaymentTerm(index, e.target.value)} />
                  <RemoveButton label="Remove" onClick={() => removePaymentTerm(index)} />
                </div>
              ))}
            </div>
          )}
        </EditorCard>

        <EditorCard
          title="Process steps"
          description="Shown as the numbered customer journey on /pricing."
          actions={<Button type="button" variant="outline" size="sm" onClick={addProcessStep}><Icon name="plus" className="h-4 w-4" /> Add step</Button>}
        >
          {config.process.length === 0 ? <p className="text-sm text-mist-500">No process steps yet.</p> : (
            <div className="space-y-4">
              {config.process.map((step, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-mist-200 bg-mist-50 p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
                  <Field label="Title"><Input value={step.title} onChange={(e) => patchProcessStep(index, { title: e.target.value })} /></Field>
                  <Field label="Text"><Textarea rows={2} value={step.text} onChange={(e) => patchProcessStep(index, { text: e.target.value })} /></Field>
                  <RemoveButton label="Remove" onClick={() => removeProcessStep(index)} />
                </div>
              ))}
            </div>
          )}
        </EditorCard>

        <EditorCard
          title="FAQs"
          description="Shown in the FAQ section and in the pricing standard export."
          actions={<Button type="button" variant="outline" size="sm" onClick={addFaq}><Icon name="plus" className="h-4 w-4" /> Add FAQ</Button>}
        >
          {config.faqs.length === 0 ? <p className="text-sm text-mist-500">No FAQs yet.</p> : (
            <div className="space-y-4">
              {config.faqs.map((faq, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-mist-200 bg-mist-50 p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
                  <Field label="Question"><Input value={faq.question} onChange={(e) => patchFaq(index, { question: e.target.value })} /></Field>
                  <Field label="Answer"><Textarea rows={3} value={faq.answer} onChange={(e) => patchFaq(index, { answer: e.target.value })} /></Field>
                  <RemoveButton label="Remove" onClick={() => removeFaq(index)} />
                </div>
              ))}
            </div>
          )}
        </EditorCard>
      </div>
    );
  }

  function renderAdvanced() {
    return (
      <div data-reveal="zoom" className="space-y-5">
        <EditorCard
          title="Configuration JSON"
          description="Export the full configuration, import a saved JSON file, or edit every field at once. Changes here are applied to the editor before saving."
          actions={
            <>
              <Button type="button" variant="outline" size="sm" onClick={downloadJson}><Icon name="download" className="h-4 w-4" /> Download JSON</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Icon name="plus" className="h-4 w-4" /> Import JSON</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => repairCurrent()} data-magnetic><Icon name="sparkles" className="h-4 w-4" /> Repair IDs</Button>
            </>
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={async (e) => {
              await importJson(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={loadJsonFromConfig}><Icon name="refresh" className="h-4 w-4" /> Load editor state</Button>
            <Button type="button" variant="ghost" size="sm" onClick={formatJson}><Icon name="code" className="h-4 w-4" /> Format JSON</Button>
            <Button type="button" size="sm" onClick={applyJson}><Icon name="check" className="h-4 w-4" /> Apply JSON to editor</Button>
          </div>
          {jsonMessage ? <p className="mt-3 text-sm font-medium text-mist-700">{jsonMessage}</p> : null}
          <Textarea
            aria-label="Pricing configuration JSON"
            className="mt-4 min-h-[420px] font-mono text-xs"
            value={jsonText}
            onChange={(e) => updateJsonText(e.target.value)}
            spellCheck={false}
          />
          <p className="mt-2 text-xs leading-relaxed text-mist-500">
            The JSON is validated against the same schema as the form editor. Unknown copy keys are ignored, invalid package/group IDs and stale starting-package references are repaired automatically, and duplicate IDs are made unique. Other invalid data keeps the built-in fallback rate card.
          </p>
        </EditorCard>
      </div>
    );
  }

  const planCount = config.services.reduce((total, entry) => total + entry.plans.length, 0);

  return (
    <div className="space-y-5">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-electric-200 bg-white p-3 shadow-card-lg" aria-label="Publish pricing">
        <div className="text-sm" role="status" aria-live="polite">
          <p className="font-bold text-navy-900">{dirty || jsonEdited ? "Unpublished pricing changes" : "Pricing is up to date"}</p>
          <p className="text-xs text-mist-600">{jsonEdited ? "Apply edited JSON before publishing." : dirty ? "Save to make these changes visible on the public site." : "Changes appear publicly after you save."}</p>
          {error ? <p className="text-xs font-semibold text-red-700" role="alert">{error}</p> : notice ? <p className="text-xs font-semibold text-emerald-700">{notice}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-electric-700 underline underline-offset-2">View public pricing</a>
          <Button type="button" onClick={save} disabled={busy} className="gap-1.5"><Icon name="check" className="h-4 w-4" /> {busy ? "Saving…" : "Save & publish pricing"}</Button>
        </div>
      </div>
      <PricingStudioHeader
        isCustom={isCustom}
        dirty={dirty || jsonEdited}
        saving={busy}
        services={config.services.length}
        plans={planCount}
        effectiveDate={config.standard.effectiveDate}
        repairsCount={autoRepairs.length}
        onSave={save}
        onRepair={() => repairCurrent()}
      />
      {updatedAt ? (
        <p className="-mt-2 text-right text-[11px] text-mist-500">Last saved {new Date(updatedAt).toLocaleString()}</p>
      ) : null}

      <div data-reveal className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white p-3 shadow-card">
        <div className="flex flex-wrap gap-1.5" data-stagger data-delay="80">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={classNames(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                tab === item.id ? "pricing-tab-active bg-electric-600 text-white shadow-[0_8px_20px_-10px_rgb(37_99_235/0.8)]" : "text-mist-600 hover:bg-mist-100 hover:text-navy-900",
              )}
            >
              <Icon name={item.icon} className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={resetDefaults} disabled={busy || !isCustom} data-magnetic>
            <Icon name="refresh" className="h-4 w-4" /> Reset defaults
          </Button>
        </div>
      </div>

      <ErrorBanner message={error} />
      <NoticeBanner message={notice} />

      {issues.length > 0 ? (
        <Card className="pricing-issue-banner border-red-200 bg-red-50 p-4" data-reveal="zoom">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Icon name="alert-triangle" className="pricing-issue-icon mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <h3 className="font-display text-sm font-bold text-red-800">{issues.length} validation issue{issues.length === 1 ? "" : "s"}</h3>
                <p className="mt-1 text-xs text-red-700">Most ID and starting-package problems can be fixed automatically. The rest are listed below.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => repairCurrent()} className="gap-1.5" data-magnetic>
                <Icon name="sparkles" className="h-3.5 w-3.5" /> Fix automatically
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => changeTab("advanced")} data-magnetic>Open JSON</Button>
            </div>
          </div>
          <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-xs text-red-700">
            {issues.slice(0, 12).map((issue, index) => (
              <li key={`${issue.path}-${index}`}><code className="font-mono">{issue.path}</code> — {issue.message}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {tab === "general" ? renderGeneral() : null}
      {tab === "prices" ? renderPrices() : null}
      {tab === "content" ? renderContent() : null}
      {tab === "policies" ? renderPolicies() : null}
      {tab === "advanced" ? renderAdvanced() : null}

      <div data-reveal className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white p-4 shadow-card">
        <p className="text-xs text-mist-500">
          {dirty ? "You have unsaved changes." : "All changes are saved."} Pricing is shown in {config.currencyLabel} ({config.currency}, {config.symbol}).
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => changeTab("advanced")} data-magnetic><Icon name="code" className="h-4 w-4" /> JSON</Button>
          <Button type="button" size="sm" onClick={save} disabled={busy} className="btn-shine pricing-save-glow" data-magnetic><Icon name="check" className="h-4 w-4" /> {busy ? "Saving…" : "Save changes"}</Button>
        </div>
      </div>
    </div>
  );
}
