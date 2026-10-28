"use client";

import { useMemo, useState } from "react";
import { Badge, Button, ButtonLink, Label, Select } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  estimateHasStartingPrice,
  estimateTotal,
  formatGHSFrom,
  getPricingGroupServicesFrom,
  getPricingPlansFrom,
  getServicePricingFrom,
  planPriceLabelFrom,
  planUnitLabel,
  pricingCopy,
  serviceShortName,
  type PricingConfig,
} from "@/lib/pricing-config";
import { classNames } from "@/lib/utils";

export function PricingEstimator({ config }: { config: PricingConfig }) {
  const [serviceSlug, setServiceSlug] = useState(config.services[0]?.serviceSlug ?? "");
  const [planId, setPlanId] = useState(config.services[0]?.plans[0]?.id ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeService = config.services.find((entry) => entry.serviceSlug === serviceSlug) ?? config.services[0];
  const activePlan = activeService?.plans.find((plan) => plan.id === planId) ?? activeService?.plans[0];
  const selectedPlans = useMemo(() => getPricingPlansFrom(config, selectedIds), [config, selectedIds]);
  const total = estimateTotal(selectedPlans);
  const hasStartingPrice = estimateHasStartingPrice(selectedPlans);
  const activeServiceName = serviceShortName(config, activeService);
  const copy = (key: string) => pricingCopy(config, key);

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
    const next = config.services.find((entry) => entry.serviceSlug === slug);
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

  if (!activeService || !activePlan) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div data-tilt={5} className="tilt-shell rounded-2xl border border-mist-200 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600">
            <Icon name="layers" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-navy-900">{copy("pricing.estimatorTitle")}</h3>
            <p className="mt-1 text-sm leading-relaxed text-mist-600">{copy("pricing.estimatorIntro")}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="estimate-service">{copy("pricing.estimatorServiceLabel")}</Label>
            <Select id="estimate-service" value={serviceSlug} onChange={(e) => changeService(e.target.value)}>
              {config.groups.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {getPricingGroupServicesFrom(config, group.id).map((entry) => (
                    <option key={entry.serviceSlug} value={entry.serviceSlug}>
                      {serviceShortName(config, entry)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="estimate-package">{copy("pricing.estimatorPackageLabel")}</Label>
            <Select id="estimate-package" value={activePlan.id} onChange={(e) => setPlanId(e.target.value)}>
              {activeService.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {planPriceLabelFrom(config, plan)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-electric-100 bg-electric-50/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-electric-700">{activeServiceName}</p>
              <h4 className="mt-1 font-display text-lg font-bold text-navy-900">{activePlan.name}</h4>
            </div>
            <Badge tone={activePlan.kind === "fixed" ? "green" : "blue"}>
              {activePlan.kind === "fixed" ? copy("pricing.estimatorFixedBadge") : copy("pricing.estimatorFromBadge")}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-mist-700">{activePlan.summary}</p>
          <p className="mt-4 font-display text-2xl font-bold text-navy-900">
            {planPriceLabelFrom(config, activePlan)}{" "}
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
            {activePlan.duration} · {copy("pricing.estimatorBestForLabel")}: {activePlan.bestFor}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={addPlan} disabled={selectedIds.includes(activePlan.id)}>
            <Icon name="plus" className="h-4 w-4" />
            {selectedIds.includes(activePlan.id) ? copy("pricing.estimatorAddedButton") : copy("pricing.estimatorAddButton")}
          </Button>
          <ButtonLink href="/pricing#packages" variant="outline">
            {copy("pricing.estimatorCompareButton")}
          </ButtonLink>
        </div>
      </div>

      <aside
        aria-live="polite"
        data-reveal
        data-delay="120ms"
        className="rounded-2xl border border-navy-700 bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white shadow-card-lg sm:p-8 lg:sticky lg:top-24"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-300">Your estimate</p>
            <h3 className="mt-2 font-display text-xl font-bold">{copy("pricing.estimatorSummaryTitle")}</h3>
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
            <p className="mt-3 text-sm font-semibold text-white">{copy("pricing.estimatorEmptyTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-mist-400">{copy("pricing.estimatorEmptyText")}</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {selectedPlans.map((plan) => (
              <li key={plan.id} className="flex items-start gap-3 rounded-xl bg-white/[0.05] p-3.5 ring-1 ring-inset ring-white/10">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-electric-300">
                    {serviceShortName(config, getServicePricingFrom(config, plan.serviceSlug))}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-white">{plan.name}</p>
                  <p className="mt-1 text-xs text-mist-400">
                    {planPriceLabelFrom(config, plan)} · {planUnitLabel(plan)}
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
              <p className="text-sm font-medium text-mist-300">{copy("pricing.estimatorTotalLabel")}</p>
              <p className="mt-1 text-xs text-mist-500">{copy("pricing.estimatorAllGhsLabel")}</p>
            </div>
            <p className="font-display text-3xl font-bold text-white">
              {formatGHSFrom(config, total)}
              {hasStartingPrice ? "+" : ""}
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-mist-400">
            {hasStartingPrice ? copy("pricing.estimatorMinimumNote") : copy("pricing.estimatorExactNote")}
          </p>

          {selectedPlans.length > 0 ? (
            <ButtonLink href={enquiryHref} size="lg" className="mt-6 w-full">
              {copy("pricing.estimatorContinueButton")} <Icon name="arrow-right" className="h-4 w-4" />
            </ButtonLink>
          ) : (
            <Button type="button" size="lg" variant="dark" disabled className="mt-6 w-full">
              {copy("pricing.estimatorChooseFirstButton")}
            </Button>
          )}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-mist-500">
            {copy("pricing.estimatorNoPaymentNote")}
          </p>
        </div>
      </aside>
    </div>
  );
}
