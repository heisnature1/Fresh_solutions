import { describe, expect, it } from "vitest";
import { SERVICES } from "../lib/constants";
import {
  ALL_PRICING_PLANS,
  buildEstimateBrief,
  buildEstimateTitle,
  estimateHasStartingPrice,
  estimateTotal,
  formatGHS,
  getPricingPlan,
  getPricingPlans,
  getServicePricing,
  getServiceStartingPrice,
  PRICING_CURRENCY,
  SERVICE_PRICING,
} from "../lib/pricing";

describe("public pricing standard", () => {
  it("is denominated in Ghana cedis", () => {
    expect(PRICING_CURRENCY).toBe("GHS");
    expect(formatGHS(2_500)).toBe("GH₵2,500");
  });

  it("covers every published service exactly once", () => {
    expect(SERVICE_PRICING).toHaveLength(SERVICES.length);
    expect(new Set(SERVICE_PRICING.map((entry) => entry.serviceSlug)).size).toBe(SERVICES.length);
    for (const service of SERVICES) {
      expect(getServicePricing(service.slug)).toBeDefined();
    }
  });

  it("uses positive whole-cedi prices and unique package IDs", () => {
    expect(ALL_PRICING_PLANS.length).toBeGreaterThanOrEqual(SERVICES.length);
    expect(new Set(ALL_PRICING_PLANS.map((plan) => plan.id)).size).toBe(ALL_PRICING_PLANS.length);
    for (const plan of ALL_PRICING_PLANS) {
      expect(Number.isInteger(plan.price)).toBe(true);
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.includes.length).toBeGreaterThan(0);
      expect(plan.unit).toBeTruthy();
    }
  });

  it("shows a representative starting price for each service", () => {
    for (const service of SERVICES) {
      const start = getServiceStartingPrice(service.slug);
      expect(start, service.slug).toBeDefined();
      expect(start?.amount).toBeGreaterThan(0);
    }
    expect(getServiceStartingPrice("web-development")?.amount).toBe(2_500);
    expect(getServiceStartingPrice("cloud-hosting")?.unit).toBe("per month");
  });

  it("resolves package IDs from enquiry links safely", () => {
    const plans = getPricingPlans(["web-business-site", "not-a-real-package", "web-business-site", "it-remote-support"]);
    expect(plans.map((plan) => plan.id)).toEqual(["web-business-site", "it-remote-support"]);
    expect(getPricingPlan("web-business-site")?.price).toBe(6_000);
  });

  it("produces an indicative total and a prefilled brief", () => {
    const plans = getPricingPlans(["web-launch-page", "web-online-store"]);
    expect(estimateTotal(plans)).toBe(14_500);
    expect(estimateHasStartingPrice(plans)).toBe(true);
    expect(buildEstimateTitle(plans)).toContain("Launch Page + Online Store");
    const brief = buildEstimateBrief(plans);
    expect(brief).toContain("GH₵14,500 GHS+");
    expect(brief).toContain("Selected from the Fresh Solutions pricing guide");
    expect(brief).toContain("written quotation");
  });
});
