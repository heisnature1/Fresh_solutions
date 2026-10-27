/**
 * Admin-editable pricing configuration.
 *
 * This module is pure (no database or server-only imports) so it can be shared
 * by server pages, API routes, the public estimate builder, admin UI and tests.
 * `lib/pricing-store.ts` persists a `PricingConfig` in `site_settings`.
 */

import { z } from "zod";
import { SERVICES, getService } from "./constants";
import {
  addOnPriceLabel,
  formatEffectiveDate,
  formatGHS,
  PAYMENT_TERMS,
  planPriceLabel,
  planUnitLabel,
  PRICING_CURRENCY,
  PRICING_CURRENCY_LABEL,
  PRICING_FAQS,
  PRICING_GROUPS,
  PRICING_PROCESS,
  PRICING_RULES,
  PRICING_STANDARD,
  PRICING_SYMBOL,
  PRICING_UNITS,
  SERVICE_PRICING,
  STARTING_PLAN_IDS,
  type PriceKind,
  type PricingAddOn,
  type PricingFaq,
  type PricingGroup,
  type PricingPlan,
  type PricingProcessStep,
  type PricingRule,
  type PricingStandardSettings,
  type PricingUnit,
  type ServicePricing,
} from "./pricing";

export { planUnitLabel } from "./pricing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PricingConfig {
  version: number;
  currency: string;
  currencyLabel: string;
  symbol: string;
  standard: PricingStandardSettings;
  /** All public-facing pricing copy. Keys are documented in PAGE_COPY_GROUPS. */
  page: Record<string, string>;
  groups: PricingGroup[];
  services: ServicePricing[];
  rules: PricingRule[];
  paymentTerms: string[];
  faqs: PricingFaq[];
  process: PricingProcessStep[];
}

export interface PricingConfigIssue {
  path: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Editable page copy
// ---------------------------------------------------------------------------

export const DEFAULT_PRICING_PAGE_COPY: Record<string, string> = {
  // Hero & navigation
  "pricing.heroEyebrow": "Pricing guide",
  "pricing.heroTitle": "Clear prices in Ghana cedis, before you get in touch",
  "pricing.heroIntro":
    "Compare every Fresh Solutions service in one place. Pick a package, understand what is included, and send a prefilled request — without waiting for a price to be worked out from scratch.",
  "pricing.buildEstimateCta": "Build an estimate",
  "pricing.browsePackagesCta": "Browse all packages",
  "pricing.printCta": "Print price list",
  "pricing.badgeAllPrices": "All prices in {currency} ({symbol})",
  "pricing.badgeWrittenQuote": "Written quote before work",
  "pricing.badgeEffectivePrefix": "Effective",
  "pricing.navQuickEstimate": "Quick estimate",
  "pricing.navAllPackages": "All packages",
  "pricing.navTerms": "Terms",
  "pricing.navFaq": "FAQ",

  // Sections
  "pricing.glanceEyebrow": "At a glance",
  "pricing.glanceTitle": "A starting price for every service",
  "pricing.glanceIntro":
    "Use these cards to find the right price band, then jump to the full package details. “From” prices are minimums for the stated scope.",
  "pricing.fromLabel": "From",
  "pricing.estimateEyebrow": "Self-service",
  "pricing.estimateTitle": "Put together an indicative estimate",
  "pricing.estimateIntro":
    "Select one or more packages and see a GHS total immediately. Your choices are carried into a short enquiry so we can confirm the scope once, in writing.",
  "pricing.packagesEyebrow": "Full rate card",
  "pricing.packagesTitle": "Packages, inclusions, and optional extras",
  "pricing.packagesIntroTemplate":
    "{plans} published packages across {services} services. Every fixed package includes {revisions} rounds of revisions unless stated otherwise.",
  "pricing.standardEyebrow": "Pricing standard",
  "pricing.standardTitle": "One consistent way of quoting",
  "pricing.standardIntro":
    "These rules apply to every service on this page. They protect you from surprise charges and keep our team accountable to a clear, written scope.",
  "pricing.paymentEyebrow": "Default payment terms",
  "pricing.paymentTitle": "Clear milestones, no hidden checkout",
  "pricing.paymentIntro":
    "A quote states the payment schedule for your specific engagement. The terms below are our default and may be varied only in a written quotation.",
  "pricing.effectiveNoteTemplate":
    "Published rates effective {date}. Prices are reviewed {cycle}. An accepted written quotation is valid for {days} days unless the scope changes.",
  "pricing.processEyebrow": "How it works",
  "pricing.processTitle": "From published price to approved work",
  "pricing.processIntro":
    "You can make the first decision on your own. We only step in to verify the details that genuinely need a human check.",
  "pricing.faqEyebrow": "Questions",
  "pricing.faqTitle": "Pricing questions, answered",
  "pricing.faqIntro":
    "If your situation does not fit a package, choose the closest one and tell us what is different. We will confirm the price before doing the work.",
  "pricing.ctaHeadline": "Ready to choose a package?",
  "pricing.ctaSub":
    "Send your selection and a few details. We will confirm the scope and issue one clear GHS quotation before any work begins.",
  "pricing.ctaLabel": "Start with a package",
  "pricing.ctaSecondaryLabel": "Contact us",
  "pricing.ctaSecondaryHref": "/contact",

  // Card labels
  "pricing.serviceDetailsLabel": "Service details",
  "pricing.scopeNoteTitle": "Scope note & common extras",
  "pricing.startServiceLabel": "Start with this service",
  "pricing.choosePackageLabel": "Choose package",
  "pricing.bestForLabel": "Best for:",
  "pricing.popularLabel": "Popular",
  "pricing.fixedBadge": "Fixed",
  "pricing.fromBadge": "From",
  "pricing.servicesCountSuffix": "services",

  // Estimate builder
  "pricing.estimatorTitle": "Build a quick estimate",
  "pricing.estimatorIntro":
    "Choose one or more published packages. The total is an indication in Ghana cedis — not an invoice.",
  "pricing.estimatorServiceLabel": "Service",
  "pricing.estimatorPackageLabel": "Package",
  "pricing.estimatorAddButton": "Add to estimate",
  "pricing.estimatorAddedButton": "Already in estimate",
  "pricing.estimatorCompareButton": "Compare packages",
  "pricing.estimatorSummaryTitle": "Selected packages",
  "pricing.estimatorEmptyTitle": "No packages selected yet",
  "pricing.estimatorEmptyText":
    "Add a package to see the indicative GHS total and carry your selection into the enquiry form.",
  "pricing.estimatorTotalLabel": "Indicative total",
  "pricing.estimatorAllGhsLabel": "All amounts in GHS",
  "pricing.estimatorContinueButton": "Continue with this selection",
  "pricing.estimatorChooseFirstButton": "Choose a package first",
  "pricing.estimatorNoPaymentNote": "No online payment. We confirm the scope and send a written quotation first.",
  "pricing.estimatorMinimumNote":
    "At least one package has a starting price, so this is a minimum. Recurring prices count for one billing period.",
  "pricing.estimatorExactNote":
    "This total covers the published packages only. Recurring prices count for one billing period. Taxes and third-party costs are confirmed in your written quote.",
  "pricing.estimatorBestForLabel": "Best for",
  "pricing.estimatorFixedBadge": "Fixed price",
  "pricing.estimatorFromBadge": "Starting price",

  // SEO
  "pricing.seoTitle": "Pricing in Ghana Cedis",
  "pricing.seoDescription":
    "Transparent Fresh Solutions prices in Ghana cedis (GHS). Compare fixed and starting prices for websites, apps, software, cybersecurity, AI, IT support, hosting, training, hardware, repairs, and consultancy.",
  "pricing.ogTitle": "Pricing in Ghana Cedis | Fresh Solutions",
  "pricing.ogDescription":
    "Compare published GHS prices, package limits, optional extras, and payment terms. Choose a package and send a prefilled enquiry.",

  // Site-wide pricing links
  "pricing.navLabel": "Pricing",
  "pricing.footerLabel": "Pricing in GHS",
  "pricing.homeHeroLinkLabel": "View pricing in GHS",
  "pricing.homeCtaTitle": "Know the price before you call",
  "pricing.homeCtaText":
    "Every service has a published Ghana-cedi starting price, package limits, optional extras, and payment terms. Build an estimate or choose a package on your own time.",
  "pricing.homeCtaLabel": "View pricing in GHS",
  "pricing.solutionsIntro":
    "Eleven service areas, one careful team. Compare published Ghana-cedi prices before you get in touch, then choose the service that fits your needs.",
  "pricing.solutionsPricingCta": "View pricing in GHS",
  "pricing.solutionsEstimateCta": "Build an estimate",
  "pricing.servicePricingCta": "View GHS pricing",
  "pricing.serviceStartingNote": "Published pricing from {price} {unit} · All prices in {currency}.",
  "pricing.repairsPricingCta": "View repair prices",
  "pricing.repairsStartingNote":
    "Diagnosis from {price} {unit} · Parts and approved repair labour are quoted separately.",
  "pricing.startProjectLinkLabel": "View pricing guide",
  "pricing.startProjectSelectedIntro":
    "Your chosen packages are below. Add a few details and we will confirm the scope and final GHS quotation in writing.",
  "pricing.startProjectDefaultIntro":
    "Six quick steps. No account needed, no obligation — just a clear reference and a real response from our team.",
  "pricing.startProjectNotice":
    "Your selected packages have been added to the project description below. You can edit or add to it.",
  "pricing.startProjectSelectedBadge": "Selected from pricing guide",
  "pricing.startProjectChosenTitle": "Your chosen packages",
  "pricing.startProjectChangeSelection": "Change selection",
  "pricing.startProjectTotalLabel": "Indicative published total",
  "pricing.startProjectMinimumLabel": "Minimum estimate",
  "pricing.startProjectExactLabel": "Published package total",
  "pricing.startProjectRecurringNote": "Recurring items count for one billing period.",
  "pricing.startProjectDisclaimer":
    "This is an indication, not an invoice. Taxes, third-party costs, scope changes, and payment milestones are confirmed in a written quotation before any work begins.",
};

export const PAGE_COPY_GROUPS: Array<{ id: string; label: string; keys: string[] }> = [
  {
    id: "hero",
    label: "Hero & navigation",
    keys: [
      "pricing.heroEyebrow", "pricing.heroTitle", "pricing.heroIntro",
      "pricing.buildEstimateCta", "pricing.browsePackagesCta", "pricing.printCta",
      "pricing.badgeAllPrices", "pricing.badgeWrittenQuote", "pricing.badgeEffectivePrefix",
      "pricing.navQuickEstimate", "pricing.navAllPackages", "pricing.navTerms", "pricing.navFaq",
    ],
  },
  {
    id: "sections",
    label: "Page sections",
    keys: [
      "pricing.glanceEyebrow", "pricing.glanceTitle", "pricing.glanceIntro", "pricing.fromLabel",
      "pricing.estimateEyebrow", "pricing.estimateTitle", "pricing.estimateIntro",
      "pricing.packagesEyebrow", "pricing.packagesTitle", "pricing.packagesIntroTemplate",
      "pricing.standardEyebrow", "pricing.standardTitle", "pricing.standardIntro",
      "pricing.paymentEyebrow", "pricing.paymentTitle", "pricing.paymentIntro", "pricing.effectiveNoteTemplate",
      "pricing.processEyebrow", "pricing.processTitle", "pricing.processIntro",
      "pricing.faqEyebrow", "pricing.faqTitle", "pricing.faqIntro",
      "pricing.ctaHeadline", "pricing.ctaSub", "pricing.ctaLabel",
      "pricing.ctaSecondaryLabel", "pricing.ctaSecondaryHref",
    ],
  },
  {
    id: "labels",
    label: "Cards & labels",
    keys: [
      "pricing.serviceDetailsLabel", "pricing.scopeNoteTitle", "pricing.startServiceLabel",
      "pricing.choosePackageLabel", "pricing.bestForLabel", "pricing.popularLabel",
      "pricing.fixedBadge", "pricing.fromBadge", "pricing.servicesCountSuffix",
    ],
  },
  {
    id: "estimator",
    label: "Estimate builder",
    keys: [
      "pricing.estimatorTitle", "pricing.estimatorIntro", "pricing.estimatorServiceLabel",
      "pricing.estimatorPackageLabel", "pricing.estimatorAddButton", "pricing.estimatorAddedButton",
      "pricing.estimatorCompareButton", "pricing.estimatorSummaryTitle", "pricing.estimatorEmptyTitle",
      "pricing.estimatorEmptyText", "pricing.estimatorTotalLabel", "pricing.estimatorAllGhsLabel",
      "pricing.estimatorContinueButton", "pricing.estimatorChooseFirstButton",
      "pricing.estimatorNoPaymentNote", "pricing.estimatorMinimumNote", "pricing.estimatorExactNote",
      "pricing.estimatorBestForLabel", "pricing.estimatorFixedBadge", "pricing.estimatorFromBadge",
    ],
  },
  {
    id: "seo",
    label: "SEO & site links",
    keys: [
      "pricing.seoTitle", "pricing.seoDescription", "pricing.ogTitle", "pricing.ogDescription",
      "pricing.navLabel", "pricing.footerLabel", "pricing.homeHeroLinkLabel",
      "pricing.homeCtaTitle", "pricing.homeCtaText", "pricing.homeCtaLabel",
      "pricing.solutionsIntro", "pricing.solutionsPricingCta", "pricing.solutionsEstimateCta",
      "pricing.servicePricingCta", "pricing.serviceStartingNote", "pricing.repairsPricingCta",
      "pricing.repairsStartingNote", "pricing.startProjectLinkLabel",
      "pricing.startProjectSelectedIntro", "pricing.startProjectDefaultIntro",
      "pricing.startProjectNotice", "pricing.startProjectSelectedBadge",
      "pricing.startProjectChosenTitle", "pricing.startProjectChangeSelection",
      "pricing.startProjectTotalLabel", "pricing.startProjectMinimumLabel",
      "pricing.startProjectExactLabel", "pricing.startProjectRecurringNote",
      "pricing.startProjectDisclaimer",
    ],
  },
];

export const ALL_PAGE_COPY_KEYS = PAGE_COPY_GROUPS.flatMap((group) => group.keys);

export const MULTILINE_COPY_KEYS = new Set([
  "pricing.heroIntro", "pricing.glanceIntro", "pricing.estimateIntro", "pricing.packagesIntroTemplate",
  "pricing.standardIntro", "pricing.paymentIntro", "pricing.effectiveNoteTemplate", "pricing.processIntro",
  "pricing.faqIntro", "pricing.ctaSub", "pricing.estimatorIntro", "pricing.estimatorEmptyText",
  "pricing.estimatorMinimumNote", "pricing.estimatorExactNote", "pricing.seoDescription",
  "pricing.ogDescription", "pricing.homeCtaText", "pricing.solutionsIntro", "pricing.serviceStartingNote",
  "pricing.repairsStartingNote", "pricing.startProjectSelectedIntro", "pricing.startProjectDefaultIntro",
  "pricing.startProjectNotice", "pricing.startProjectDisclaimer",
]);

export function humanizeCopyKey(key: string): string {
  const part = key.split(".").pop() ?? key;
  return part
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const shortText = (max: number, label = "Text") => z.string().trim().min(1, `${label} is required.`).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const isoDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date format.");
const money = z.coerce.number().int("Use whole cedis.").min(0, "Price cannot be negative.").max(10_000_000);
const unit = z.string().trim().min(1).max(40);
const kind: z.ZodType<PriceKind> = z.enum(["fixed", "from"]);

const standardSchema = z.object({
  effectiveDate: isoDate,
  quoteValidityDays: z.coerce.number().int().min(1).max(365),
  reviewCycle: shortText(100, "Review cycle"),
  includedRevisionRounds: z.coerce.number().int().min(0).max(20),
  standardHourlyRate: money,
  depositPercent: z.coerce.number().int().min(0).max(100),
  largeProjectThreshold: money,
  freeIntroCallMinutes: z.coerce.number().int().min(0).max(240),
});

const groupSchema = z.object({
  id: shortText(60, "Group ID").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  label: shortText(200, "Group label"),
  shortLabel: shortText(100, "Short label"),
  description: shortText(2000, "Description"),
});

const planSchema = z.object({
  id: shortText(100, "Package ID").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  serviceSlug: shortText(100, "Service slug"),
  name: shortText(200, "Package name"),
  summary: shortText(1000, "Summary"),
  price: money,
  unit,
  kind,
  duration: shortText(200, "Duration"),
  bestFor: shortText(1000, "Best for"),
  includes: z.array(shortText(500, "Inclusion")).min(1).max(30),
  featured: z.boolean().optional().default(false),
});

const addOnSchema = z.object({
  label: shortText(200, "Extra label"),
  price: money,
  unit,
  note: optionalText(300),
});

const serviceSchema = z.object({
  serviceSlug: shortText(100, "Service slug"),
  groupId: shortText(60, "Group ID"),
  intro: shortText(2000, "Intro"),
  note: shortText(2000, "Scope note"),
  plans: z.array(planSchema).min(1).max(50),
  addOns: z.array(addOnSchema).max(50),
  actionHref: optionalText(500),
  actionLabel: optionalText(200),
  name: optionalText(200),
  shortName: optionalText(120),
  icon: optionalText(80),
  detailsHref: optionalText(500),
  startingPlanId: optionalText(100),
});

const ruleSchema = z.object({
  icon: shortText(80, "Icon"),
  title: shortText(200, "Title"),
  description: shortText(2000, "Description"),
});

const faqSchema = z.object({
  question: shortText(300, "Question"),
  answer: shortText(3000, "Answer"),
});

const processSchema = z.object({
  title: shortText(200, "Title"),
  text: shortText(2000, "Text"),
});

export const pricingConfigSchema = z
  .object({
    version: z.coerce.number().int().min(1).max(100).default(1),
    currency: z.string().trim().length(3, "Use a 3-letter ISO currency code.").toUpperCase().default(PRICING_CURRENCY),
    currencyLabel: shortText(100, "Currency label").default(PRICING_CURRENCY_LABEL),
    symbol: shortText(10, "Currency symbol").default(PRICING_SYMBOL),
    standard: standardSchema,
    page: z.record(z.string().max(20000)).default({}),
    groups: z.array(groupSchema).min(1).max(30),
    services: z.array(serviceSchema).min(1).max(100),
    rules: z.array(ruleSchema).max(50),
    paymentTerms: z.array(shortText(2000, "Payment term")).max(50),
    faqs: z.array(faqSchema).max(100),
    process: z.array(processSchema).max(30),
  })
  .superRefine((config, ctx) => {
    const knownSlugs = new Set(SERVICES.map((service) => service.slug));
    const groupIds = new Set<string>();
    for (const group of config.groups) {
      if (groupIds.has(group.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["groups"], message: `Duplicate group ID: ${group.id}` });
      groupIds.add(group.id);
    }
    const serviceSlugs = new Set<string>();
    const planIds = new Set<string>();
    for (const [sIndex, service] of config.services.entries()) {
      if (serviceSlugs.has(service.serviceSlug)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services", sIndex, "serviceSlug"], message: `Duplicate service slug: ${service.serviceSlug}` });
      }
      serviceSlugs.add(service.serviceSlug);
      if (!groupIds.has(service.groupId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services", sIndex, "groupId"], message: "Choose an existing group." });
      }
      if (!knownSlugs.has(service.serviceSlug) && !service.name) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services", sIndex, "name"], message: "Custom services need a display name." });
      }
      for (const [pIndex, plan] of service.plans.entries()) {
        if (planIds.has(plan.id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services", sIndex, "plans", pIndex, "id"], message: `Duplicate package ID: ${plan.id}` });
        }
        planIds.add(plan.id);
        if (plan.serviceSlug !== service.serviceSlug) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services", sIndex, "plans", pIndex, "serviceSlug"], message: "Package service slug must match its parent service." });
        }
      }
      if (service.startingPlanId && !service.plans.some((plan) => plan.id === service.startingPlanId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services", sIndex, "startingPlanId"], message: "Starting package must be one of this service's packages." });
      }
    }
  });

export type PricingConfigInput = z.infer<typeof pricingConfigSchema>;

// ---------------------------------------------------------------------------
// Defaults & normalization
// ---------------------------------------------------------------------------

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function defaultServices(): ServicePricing[] {
  return clone(SERVICE_PRICING).map((entry) => ({
    ...entry,
    startingPlanId: STARTING_PLAN_IDS[entry.serviceSlug],
    plans: entry.plans.map((plan) => ({ ...plan, featured: plan.featured ?? false })),
  }));
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  version: 1,
  currency: PRICING_CURRENCY,
  currencyLabel: PRICING_CURRENCY_LABEL,
  symbol: PRICING_SYMBOL,
  standard: clone(PRICING_STANDARD),
  page: clone(DEFAULT_PRICING_PAGE_COPY),
  groups: clone(PRICING_GROUPS),
  services: defaultServices(),
  rules: clone(PRICING_RULES),
  paymentTerms: [...PAYMENT_TERMS],
  faqs: clone(PRICING_FAQS),
  process: clone(PRICING_PROCESS),
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> {
  if (!isPlainObject(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") out[key] = item;
  }
  return out;
}

function normalizeService(raw: unknown): unknown {
  if (!isPlainObject(raw)) return raw;
  const slug = typeof raw.serviceSlug === "string" ? raw.serviceSlug.trim() : "";
  const fallback = DEFAULT_PRICING_CONFIG.services.find((entry) => entry.serviceSlug === slug);
  const merged: Record<string, unknown> = fallback ? { ...clone(fallback), ...raw } : { ...raw };
  merged.serviceSlug = slug;
  if (Array.isArray(merged.plans)) {
    merged.plans = merged.plans.map((plan) => (isPlainObject(plan) ? { ...plan, serviceSlug: slug } : plan));
  }
  return merged;
}

function buildPricingCandidate(value: unknown): unknown {
  const base = clone(DEFAULT_PRICING_CONFIG);
  if (!isPlainObject(value)) return base;
  return {
    ...base,
    ...value,
    standard: { ...base.standard, ...(isPlainObject(value.standard) ? value.standard : {}) },
    page: { ...base.page, ...stringRecord(value.page) },
    groups: Array.isArray(value.groups) ? value.groups : base.groups,
    services: Array.isArray(value.services) ? value.services.map(normalizeService) : base.services,
    rules: Array.isArray(value.rules) ? value.rules : base.rules,
    paymentTerms: Array.isArray(value.paymentTerms) ? value.paymentTerms : base.paymentTerms,
    faqs: Array.isArray(value.faqs) ? value.faqs : base.faqs,
    process: Array.isArray(value.process) ? value.process : base.process,
  };
}

function configFromParsed(data: PricingConfigInput): PricingConfig {
  return {
    ...data,
    page: { ...DEFAULT_PRICING_PAGE_COPY, ...data.page },
  };
}

/** Validate an untrusted value and always return a usable PricingConfig. */
export function normalizePricingConfig(value: unknown): PricingConfig {
  const parsed = pricingConfigSchema.safeParse(buildPricingCandidate(value));
  if (!parsed.success) return clone(DEFAULT_PRICING_CONFIG);
  return configFromParsed(parsed.data);
}

export function validatePricingConfig(value: unknown): { ok: true; config: PricingConfig } | { ok: false; issues: PricingConfigIssue[] } {
  const parsed = pricingConfigSchema.safeParse(buildPricingCandidate(value));
  if (parsed.success) return { ok: true, config: configFromParsed(parsed.data) };
  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => ({ path: issue.path.join(".") || "config", message: issue.message })),
  };
}

// ---------------------------------------------------------------------------
// Config-aware helpers
// ---------------------------------------------------------------------------

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function pricingCopy(config: PricingConfig, key: string): string {
  return config.page[key] ?? DEFAULT_PRICING_PAGE_COPY[key] ?? "";
}

export function pricingCopyWith(config: PricingConfig, key: string, vars: Record<string, string | number>): string {
  return interpolate(pricingCopy(config, key), vars);
}

export function allPricingPlansFrom(config: PricingConfig): PricingPlan[] {
  return config.services.flatMap((entry) => entry.plans);
}

export function getPricingGroupFrom(config: PricingConfig, groupId: string): PricingGroup | undefined {
  return config.groups.find((group) => group.id === groupId);
}

export function getServicePricingFrom(config: PricingConfig, slug: string): ServicePricing | undefined {
  return config.services.find((entry) => entry.serviceSlug === slug);
}

export function getPricingGroupServicesFrom(config: PricingConfig, groupId: string): ServicePricing[] {
  return config.services.filter((entry) => entry.groupId === groupId);
}

export function getServicePricingAnchorFrom(config: PricingConfig, slug: string): string {
  return `#${getServicePricingFrom(config, slug)?.groupId ?? "packages"}`;
}

export function getPricingPlanFrom(config: PricingConfig, id: string): PricingPlan | undefined {
  return allPricingPlansFrom(config).find((plan) => plan.id === id);
}

export function getPricingPlansFrom(config: PricingConfig, ids: readonly string[], limit = 12): PricingPlan[] {
  const seen = new Set<string>();
  const plans: PricingPlan[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const plan = getPricingPlanFrom(config, id);
    if (!plan) continue;
    seen.add(id);
    plans.push(plan);
    if (plans.length >= limit) break;
  }
  return plans;
}

export function getServiceStartingPriceFrom(
  config: PricingConfig,
  slug: string,
): { amount: number; unit: PricingUnit; kind: PriceKind } | undefined {
  const entry = getServicePricingFrom(config, slug);
  if (!entry || entry.plans.length === 0) return undefined;
  const preferred = entry.startingPlanId
    ? entry.plans.find((plan) => plan.id === entry.startingPlanId)
    : undefined;
  if (preferred) return { amount: preferred.price, unit: preferred.unit, kind: preferred.kind };
  const nonMonthly = entry.plans.filter((plan) => !plan.unit.includes("month"));
  const candidates = nonMonthly.length > 0 ? nonMonthly : entry.plans;
  const lowest = [...candidates].sort((a, b) => a.price - b.price)[0];
  return { amount: lowest.price, unit: lowest.unit, kind: lowest.kind };
}

export function estimateTotal(plans: readonly PricingPlan[]): number {
  return plans.reduce((total, plan) => total + plan.price, 0);
}

export function estimateHasStartingPrice(plans: readonly PricingPlan[]): boolean {
  return plans.some((plan) => plan.kind === "from");
}

export function buildEstimateTitle(plans: readonly PricingPlan[]): string {
  if (plans.length === 0) return "";
  const names = plans.slice(0, 2).map((plan) => plan.name);
  const suffix = plans.length > 2 ? ` + ${plans.length - 2} more` : "";
  return `${names.join(" + ")}${suffix} enquiry`;
}

export function buildEstimateBriefFrom(config: PricingConfig, plans: readonly PricingPlan[]): string {
  if (plans.length === 0) return "";
  const total = estimateTotal(plans);
  const minimum = estimateHasStartingPrice(plans);
  const lines = plans.map((plan) => {
    const entry = getServicePricingFrom(config, plan.serviceSlug);
    const serviceName = serviceShortName(config, entry);
    return `• ${serviceName} — ${plan.name}: ${planPriceLabel(plan, config.symbol)} ${planUnitLabel(plan)}`;
  });
  return [
    "Selected from the Fresh Solutions pricing guide:",
    ...lines,
    "",
    `Indicative published total${minimum ? " (minimum)" : ""}: ${formatGHS(total, config.symbol)} ${config.currency}${minimum ? "+" : ""}.`,
    "Recurring prices are counted for one billing period only. Please confirm the final scope, taxes, third-party costs, and payment milestones in a written quotation before work begins.",
  ].join("\n");
}

export function formatEffectiveDateFrom(config: PricingConfig): string {
  return formatEffectiveDate(config.standard.effectiveDate);
}

export function formatGHSFrom(config: PricingConfig, amount: number): string {
  return formatGHS(amount, config.symbol);
}

export function planPriceLabelFrom(config: PricingConfig, plan: PricingPlan): string {
  return planPriceLabel(plan, config.symbol);
}

export function addOnPriceLabelFrom(config: PricingConfig, addOn: PricingAddOn): string {
  return addOnPriceLabel(addOn, config.symbol);
}

export function serviceDisplayName(config: PricingConfig, entry?: ServicePricing): string {
  if (!entry) return "Service";
  return entry.name || getService(entry.serviceSlug)?.name || entry.shortName || entry.serviceSlug;
}

export function serviceShortName(config: PricingConfig, entry?: ServicePricing): string {
  if (!entry) return "Service";
  return entry.shortName || getService(entry.serviceSlug)?.shortName || entry.name || entry.serviceSlug;
}

export function serviceIcon(config: PricingConfig, entry?: ServicePricing): string {
  if (!entry) return "layers";
  return entry.icon || getService(entry.serviceSlug)?.icon || "layers";
}

export function serviceDetailsHref(config: PricingConfig, entry?: ServicePricing): string | null {
  if (!entry) return null;
  if (entry.detailsHref) return entry.detailsHref;
  const service = getService(entry.serviceSlug);
  if (!service) return null;
  return service.isRepairService ? "/repairs" : `/solutions/${service.slug}`;
}

export function serviceActionHref(config: PricingConfig, entry?: ServicePricing): string {
  if (!entry) return "/start-a-project";
  return entry.actionHref || `/start-a-project?service=${encodeURIComponent(entry.serviceSlug)}`;
}

export function pricingStructuredData(config: PricingConfig, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `Fresh Solutions service pricing in ${config.currencyLabel.toLowerCase()}`,
    description: `Published fixed and starting prices for all Fresh Solutions services, in ${config.currency}.`,
    url: `${baseUrl}/pricing`,
    priceCurrency: config.currency,
    itemListElement: config.groups.map((group) => ({
      "@type": "OfferCatalog",
      name: group.label,
      description: group.description,
      itemListElement: getPricingGroupServicesFrom(config, group.id).flatMap((entry) =>
        entry.plans.map((plan) => ({
          "@type": "Offer",
          name: `${serviceDisplayName(config, entry)} — ${plan.name}`,
          description: `${plan.summary} ${plan.kind === "from" ? "Starting price." : "Fixed package price."} ${planUnitLabel(plan)}.`,
          price: plan.price,
          priceCurrency: config.currency,
          url: `${baseUrl}/pricing#${entry.serviceSlug}`,
        })),
      ),
    })),
  };
}

export const PRICING_UNIT_OPTIONS = PRICING_UNITS;
