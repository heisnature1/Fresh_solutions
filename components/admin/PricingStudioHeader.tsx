"use client";

import { Badge, buttonStyles } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Tilt } from "@/components/site/Tilt";
import { classNames } from "@/lib/utils";

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export function PricingStudioHeader({
  isCustom,
  dirty,
  saving,
  services,
  plans,
  effectiveDate,
  repairsCount,
  onSave,
  onRepair,
}: {
  isCustom: boolean;
  dirty: boolean;
  saving: boolean;
  services: number;
  plans: number;
  effectiveDate: string;
  repairsCount: number;
  onSave: () => void;
  onRepair: () => void;
}) {
  const stats = [
    { label: "Services", value: String(services), icon: "layers" },
    { label: "Packages", value: String(plans), icon: "tag" },
    { label: "Effective", value: formatDate(effectiveDate), icon: "calendar" },
  ];

  return (
    <div className="pricing-studio" data-reveal>
      <div className="pricing-studio-grid" aria-hidden />
      <div className="pricing-studio-orb pricing-studio-orb-a" aria-hidden />
      <div className="pricing-studio-orb pricing-studio-orb-b" aria-hidden />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="pricing-studio-pulse" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-electric-300">Pricing studio</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Pricing control centre</h1>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Update every public pricing detail here — rates, packages, copy, rules, payment terms, FAQs and SEO. Invalid package IDs are
            repaired automatically so your draft can always be saved.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={isCustom ? "green" : "blue"}>{isCustom ? "Database override" : "Built-in defaults"}</Badge>
            <Badge tone={dirty ? "amber" : "neutral"}>{dirty ? "Unsaved changes" : "All changes saved"}</Badge>
            {repairsCount > 0 ? <Badge tone="purple">{repairsCount} auto-fix{repairsCount === 1 ? "" : "es"} ready</Badge> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("dark", "sm", "gap-1.5 print:hidden")}
          >
            <Icon name="external" className="h-3.5 w-3.5" /> View public page
          </a>
          <button type="button" onClick={onRepair} className={buttonStyles("outline", "sm", "gap-1.5")}>
            <Icon name="sparkles" className="h-3.5 w-3.5" /> Fix IDs
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className={buttonStyles("primary", "sm", "btn-shine gap-1.5")}
          >
            <Icon name={saving ? "refresh" : "check"} className={classNames("h-3.5 w-3.5", saving && "animate-spin")} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <Tilt key={stat.label} intensity={5} className="h-full">
            <div data-reveal data-delay={`${index * 90}ms`} className="pricing-studio-stat h-full">
              <span className="pricing-studio-stat-icon">
                <Icon name={stat.icon} className="h-4 w-4" />
              </span>
              <span className="pricing-studio-stat-value">{stat.value}</span>
              <span className="pricing-studio-stat-label">{stat.label}</span>
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
