"use client";

import { useMemo, useState } from "react";
import { Badge, Button, ButtonLink, Label, Select } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getService } from "@/lib/constants";
import {
  estimateHasStartingPrice,
  estimateTotal,
  formatGHS,
  getPricingPlans,
  planPriceLabel,
  planUnitLabel,
  PRICING_GROUPS,
  SERVICE_PRICING,
} from "@/lib/pricing";
import { classNames } from "@/lib/utils";

export function PricingEstimator() {
  const [serviceSlug, setServiceSlug] = useState(SERVICE_PRICING[0].serviceSlug);
  const [planId, setPlanId] = useState(SERVICE_PRICING[0].plans[0].id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeService = SERVICE_PRICING.find((entry) => entry.serviceSlug === serviceSlug) ?? SERVICE_PRICING[0];
  const activePlan = activeService.plans.find((plan) => plan.id === planId) ?? activeService.plans[0];
  const selectedPlans = useMemo(() => getPricingPlans(selectedIds), [selectedIds]);
  const total = estimateTotal(selectedPlans);
  const hasStartingPrice = estimateHasStartingPrice(selectedPlans);
  const activeServiceName = getService(activeService.serviceSlug)?.shortName ?? activeService.serviceSlug;

  const enquiryHref = useMemo(() => {
    if (selectedPlans.length === 0) return "#estimate";
    const params = new URLSearchParams({
      type: "quotation",
      packages: selectedPlans.map((plan) => plan.id).join(","),
      services: Array.from(new Set(selectedPlans.map((plan) => plan.serviceSlug))).join(","),
    });
    return `/start-a-project?${params.toString()}`;
  }, [selectedPlans]);

  function changeService(slug: string) {
    const next = SERVICE_PRICING.find((entry) => entry.serviceSlug === slug);
    if (!next) return;
    setServiceSlug(slug);
    setPlanId(next.plans[0]?.id ?? "");
  }

  function addPlan() {
    if (!activePlan || selectedIds.includes(activePlan.id)) return;
    setSelectedIds((prev) => [...prev, activePlan.id]);
  }

  function removePlan(id: string) {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600">
            <Icon name="layers" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-navy-900">Build a quick estimate</h3>
            <p className="mt-1 text-sm leading-relaxed text-mist-600">
              Choose one or more published packages. The total is an indication in Ghana cedis — not an invoice.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="estimate-service">Service</Label>
            <Select id="estimate-service" value={serviceSlug} onChange={(e) => changeService(e.target.value)}>
              {PRICING_GROUPS.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {SERVICE_PRICING.filter((entry) => entry.groupId === group.id).map((entry) => (
                    <option key={entry.serviceSlug} value={entry.serviceSlug}>
                      {getService(entry.serviceSlug)?.shortName ?? entry.serviceSlug}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="estimate-package">Package</Label>
            <Select id="estimate-package" value={activePlan?.id ?? ""} onChange={(e) => setPlanId(e.target.value)}>
              {activeService.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {planPriceLabel(plan)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {activePlan ? (
          <div className="mt-5 rounded-2xl border border-electric-100 bg-electric-50/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-electric-700">{activeServiceName}</p>
                <h4 className="mt-1 font-display text-lg font-bold text-navy-900">{activePlan.name}</h4>
              </div>
              <Badge tone={activePlan.kind === "fixed" ? "green" : "blue"}>
                {activePlan.kind === "fixed" ? "Fixed price" : "Starting price"}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-mist-700">{activePlan.summary}</p>
            <p className="mt-4 font-display text-2xl font-bold text-navy-900">
              {planPriceLabel(activePlan)}{" "}
              <span className="text-sm font-medium text-mist-600">{planUnitLabel(activePlan)}</span>
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {activePlan.includes.slice(0, 4).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy-800">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mist-600">
              <Icon name="clock" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {activePlan.duration} · Best for: {activePlan.bestFor}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={addPlan} disabled={!activePlan || selectedIds.includes(activePlan.id)}>
            <Icon name="plus" className="h-4 w-4" />
            {activePlan && selectedIds.includes(activePlan.id) ? "Already in estimate" : "Add to estimate"}
          </Button>
          <ButtonLink href="/pricing#packages" variant="outline">
            Compare packages
          </ButtonLink>
        </div>
      </div>

      <aside
        aria-live="polite"
        className="rounded-2xl border border-navy-700 bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white shadow-card-lg sm:p-8 lg:sticky lg:top-24"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-300">Your estimate</p>
            <h3 className="mt-2 font-display text-xl font-bold">Selected packages</h3>
          </div>
          {selectedPlans.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-mist-300 underline-offset-2 hover:text-white hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {selectedPlans.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-9 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-electric-300">
              <Icon name="file-text" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">No packages selected yet</p>
            <p className="mt-1 text-xs leading-relaxed text-mist-400">
              Add a package to see the indicative GHS total and carry your selection into the enquiry form.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {selectedPlans.map((plan) => (
              <li key={plan.id} className="flex items-start gap-3 rounded-xl bg-white/[0.05] p-3.5 ring-1 ring-inset ring-white/10">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-electric-300">
                    {getService(plan.serviceSlug)?.shortName ?? plan.serviceSlug}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-white">{plan.name}</p>
                  <p className="mt-1 text-xs text-mist-400">
                    {planPriceLabel(plan)} · {planUnitLabel(plan)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePlan(plan.id)}
                  className={classNames(
                    "rounded-lg p-1.5 text-mist-400 transition-colors",
                    "hover:bg-white/10 hover:text-white",
                  )}
                  aria-label={`Remove ${plan.name} from estimate`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 border-t border-white/10 pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-mist-300">Indicative total</p>
              <p className="mt-1 text-xs text-mist-500">All amounts in GHS</p>
            </div>
            <p className="font-display text-3xl font-bold text-white">
              {formatGHS(total)}
              {hasStartingPrice ? "+" : ""}
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-mist-400">
            {hasStartingPrice
              ? "At least one package has a starting price, so this is a minimum. Recurring prices count for one billing period."
              : "This total covers the published packages only. Recurring prices count for one billing period. Taxes and third-party costs are confirmed in your written quote."}
          </p>

          {selectedPlans.length > 0 ? (
            <ButtonLink href={enquiryHref} size="lg" className="mt-6 w-full">
              Continue with this selection <Icon name="arrow-right" className="h-4 w-4" />
            </ButtonLink>
          ) : (
            <Button type="button" size="lg" variant="dark" disabled className="mt-6 w-full">
              Choose a package first
            </Button>
          )}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-mist-500">
            No online payment. We confirm the scope and send a written quotation first.
          </p>
        </div>
      </aside>
    </div>
  );
}
