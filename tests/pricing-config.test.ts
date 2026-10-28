import { describe, expect, it } from "vitest";
import { SERVICES } from "../lib/constants";
import {
  DEFAULT_PRICING_CONFIG,
  allPricingPlansFrom,
  buildEstimateBriefFrom,
  formatGHSFrom,
  getPricingPlansFrom,
  getServiceStartingPriceFrom,
  normalizePricingConfig,
  planPriceLabelFrom,
  pricingCopy,
  pricingCopyWith,
  pricingStructuredData,
  repairPricingConfig,
  slugifyPricingId,
  validatePricingConfig,
} from "../lib/pricing-config";

describe("admin pricing configuration", () => {
  it("starts from the full checked-in rate card", () => {
    expect(DEFAULT_PRICING_CONFIG.currency).toBe("GHS");
    expect(DEFAULT_PRICING_CONFIG.symbol).toBe("GH₵");
    expect(DEFAULT_PRICING_CONFIG.services).toHaveLength(SERVICES.length);
    expect(allPricingPlansFrom(DEFAULT_PRICING_CONFIG).length).toBeGreaterThanOrEqual(40);
    expect(validatePricingConfig(DEFAULT_PRICING_CONFIG).ok).toBe(true);
  });

  it("falls back to defaults for unusable saved values", () => {
    expect(normalizePricingConfig(null)).toEqual(DEFAULT_PRICING_CONFIG);
    expect(normalizePricingConfig({ services: "broken" })).toEqual(DEFAULT_PRICING_CONFIG);
    expect(normalizePricingConfig({ currency: "usd" }).currency).toBe("USD");
  });

  it("accepts edited prices, currency symbols and page copy", () => {
    const draft = structuredClone(DEFAULT_PRICING_CONFIG);
    draft.currency = "GHS";
    draft.symbol = "GH₵";
    draft.page["pricing.heroTitle"] = "Admin edited hero title";
    draft.services[0].plans[0].price = 3_250;
    draft.services[0].plans[0].featured = true;

    const result = validatePricingConfig(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const config = result.config;
    expect(pricingCopy(config, "pricing.heroTitle")).toBe("Admin edited hero title");
    expect(getServiceStartingPriceFrom(config, draft.services[0].serviceSlug)?.amount).toBe(3_250);
    expect(planPriceLabelFrom(config, config.services[0].plans[0])).toBe("GH₵3,250");
    expect(formatGHSFrom(config, 1_000)).toBe("GH₵1,000");
    expect(buildEstimateBriefFrom(config, [config.services[0].plans[0]])).toContain("GH₵3,250 GHS");
  });

  it("rejects duplicate IDs, negative prices and broken group references", () => {
    const draft = structuredClone(DEFAULT_PRICING_CONFIG);
    draft.services[1].plans[0].id = draft.services[0].plans[0].id;
    draft.services[2].groupId = "missing-group";
    draft.services[3].plans[0].price = -10;

    const result = validatePricingConfig(draft);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const paths = result.issues.map((issue) => issue.path).join(" ");
    expect(paths).toContain("services.1.plans.0.id");
    expect(paths).toContain("services.2.groupId");
    expect(paths).toContain("services.3.plans.0.price");
  });

  it("requires a display name for custom services but allows a custom unit", () => {
    const draft = structuredClone(DEFAULT_PRICING_CONFIG);
    draft.services.push({
      ...structuredClone(draft.services[0]),
      serviceSlug: "custom-service",
      name: "",
      shortName: "",
      icon: "",
      startingPlanId: "custom-package",
      plans: draft.services[0].plans.slice(0, 1).map((plan) => ({
        ...structuredClone(plan),
        id: "custom-package",
        serviceSlug: "custom-service",
        unit: "per quarter",
      })),
      addOns: [],
    });
    expect(validatePricingConfig(draft).ok).toBe(false);

    draft.services[draft.services.length - 1].name = "Custom Service";
    const result = validatePricingConfig(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.services.at(-1)?.plans[0].unit).toBe("per quarter");
  });

  it("interpolates templates and builds structured data from saved settings", () => {
    const config = normalizePricingConfig({
      currency: "GHS",
      symbol: "GH₵",
      currencyLabel: "Ghanaian cedi",
      standard: { effectiveDate: "2027-01-01", includedRevisionRounds: 3, reviewCycle: "monthly", quoteValidityDays: 14 },
      page: { "pricing.packagesIntroTemplate": "{plans} plans, {services} services, {revisions} revisions" },
    });
    expect(pricingCopyWith(config, "pricing.packagesIntroTemplate", { plans: 47, services: 11, revisions: 3 })).toBe(
      "47 plans, 11 services, 3 revisions",
    );
    const data = pricingStructuredData(config, "https://example.com");
    expect(data.priceCurrency).toBe("GHS");
    expect(data.itemListElement[0].itemListElement.length).toBeGreaterThan(0);
    expect(data.url).toBe("https://example.com/pricing");
    expect(getPricingPlansFrom(config, ["web-launch-page", "not-real"], 12).map((plan) => plan.id)).toEqual(["web-launch-page"]);
  });

  it("slugifies free-text IDs", () => {
    expect(slugifyPricingId("  Mobile Prototype! ")).toBe("mobile-prototype");
    expect(slugifyPricingId("MVP / Build")).toBe("mvp-build");
    expect(slugifyPricingId("!!!")).toBe("");
  });

  it("repairs invalid package IDs and stale starting plan references", () => {
    const draft = structuredClone(DEFAULT_PRICING_CONFIG);
    const service = draft.services[1];
    service.plans[0].id = "Mobile Prototype";
    service.plans[1].id = "MVP Build!";
    service.startingPlanId = "Mobile Prototype";

    const result = repairPricingConfig(draft);
    expect(result.repairs.length).toBeGreaterThan(0);
    expect(result.config.services[1].plans[0].id).toBe("mobile-prototype");
    expect(result.config.services[1].plans[1].id).toBe("mvp-build");
    expect(result.config.services[1].startingPlanId).toBe("mobile-prototype");
    expect(result.config.services[1].plans.every((plan) => plan.serviceSlug === service.serviceSlug)).toBe(true);
    expect(validatePricingConfig(result.config).ok).toBe(true);
  });

  it("normalizes saved configurations instead of discarding repaired IDs", () => {
    const draft = structuredClone(DEFAULT_PRICING_CONFIG);
    draft.services[1].plans[0].id = "Mobile Prototype";
    draft.services[1].startingPlanId = "old-package-id";
    draft.groups[0].id = "Web & Apps!";

    const config = normalizePricingConfig(draft);
    expect(validatePricingConfig(config).ok).toBe(true);
    expect(config.services[1].plans[0].id).toBe("mobile-prototype");
    expect(config.services[1].startingPlanId).toBe("mobile-prototype");
    expect(config.groups[0].id).toBe("web-apps");
  });

  it("makes duplicate repaired package IDs unique", () => {
    const draft = structuredClone(DEFAULT_PRICING_CONFIG);
    draft.services[0].plans[0].id = "Same ID";
    draft.services[1].plans[0].id = "Same ID";

    const result = repairPricingConfig(draft);
    expect(result.config.services[0].plans[0].id).not.toBe(result.config.services[1].plans[0].id);
    expect(validatePricingConfig(result.config).ok).toBe(true);
  });
});
