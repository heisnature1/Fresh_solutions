import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { Icon, ServiceIcon, type IconName } from "@/components/icons";
import { PricingEstimator } from "@/components/site/PricingEstimator";
import { PrintButton } from "@/components/site/PrintButton";
import { CTABand } from "@/components/site/CTABand";
import { planUnitLabel, type PricingPlan, type ServicePricing } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/pricing-store";
import {
  addOnPriceLabelFrom,
  allPricingPlansFrom,
  formatEffectiveDateFrom,
  formatGHSFrom,
  getPricingGroupServicesFrom,
  getServiceStartingPriceFrom,
  planPriceLabelFrom,
  pricingCopy,
  pricingCopyWith,
  pricingStructuredData,
  serviceActionHref,
  serviceDetailsHref,
  serviceDisplayName,
  serviceIcon,
  serviceShortName,
  type PricingConfig,
} from "@/lib/pricing-config";
import { siteUrl } from "@/lib/settings";
import { classNames } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPricingConfig();
  return {
    title: pricingCopy(config, "pricing.seoTitle"),
    description: pricingCopy(config, "pricing.seoDescription"),
    alternates: { canonical: "/pricing" },
    openGraph: {
      title: pricingCopy(config, "pricing.ogTitle"),
      description: pricingCopy(config, "pricing.ogDescription"),
      url: "/pricing",
    },
  };
}

export default async function PricingPage() {
  const config = await getPricingConfig();
  const base = siteUrl();
  const copy = (key: string) => pricingCopy(config, key);
  const structuredData = pricingStructuredData(config, base);
  const effectiveDate = formatEffectiveDateFrom(config);
  const packagesIntro = pricingCopyWith(config, "pricing.packagesIntroTemplate", {
    plans: allPricingPlansFrom(config).length,
    services: config.services.length,
    revisions: config.standard.includedRevisionRounds,
  });
  const effectiveNote = pricingCopyWith(config, "pricing.effectiveNoteTemplate", {
    date: effectiveDate,
    cycle: config.standard.reviewCycle,
    days: config.standard.quoteValidityDays,
  });
  const allPricesBadge = pricingCopyWith(config, "pricing.badgeAllPrices", {
    currency: config.currency,
    symbol: config.symbol,
  });

  return (
    <div className="pricing-print print-invert">
      <PageHero
        eyebrow={copy("pricing.heroEyebrow")}
        title={copy("pricing.heroTitle")}
        intro={copy("pricing.heroIntro")}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3.5 print:hidden">
          <ButtonLink href="#estimate" size="lg">
            <Icon name="layers" className="h-5 w-5" /> {copy("pricing.buildEstimateCta")}
          </ButtonLink>
          <ButtonLink href="#packages" variant="dark" size="lg">
            {copy("pricing.browsePackagesCta")} <Icon name="arrow-right" className="h-5 w-5" />
          </ButtonLink>
          <PrintButton label={copy("pricing.printCta")} />
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-mist-300">
          <span className="inline-flex items-center gap-2">
            <Icon name="check-circle" className="h-4 w-4 text-electric-300" />
            {allPricesBadge}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="file-text" className="h-4 w-4 text-electric-300" />
            {copy("pricing.badgeWrittenQuote")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="clock" className="h-4 w-4 text-electric-300" />
            {copy("pricing.badgeEffectivePrefix")} {effectiveDate}
          </span>
        </div>
      </PageHero>

      {/* At-a-glance price directory */}
      <Section className="border-b border-mist-200 bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow={copy("pricing.glanceEyebrow")}
            title={copy("pricing.glanceTitle")}
            intro={copy("pricing.glanceIntro")}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {config.services.map((entry) => {
              const price = getServiceStartingPriceFrom(config, entry.serviceSlug);
              return (
                <Link key={entry.serviceSlug} href={`#${entry.groupId}`} className="group">
                  <Card hover className="flex h-full flex-col p-5 print:break-inside-avoid">
                    <div className="flex items-start justify-between gap-3">
                      <ServiceIcon icon={serviceIcon(config, entry)} />
                      <Icon name="arrow-right" className="h-4 w-4 text-mist-400 transition-transform group-hover:translate-x-1 group-hover:text-electric-600" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-navy-900">{serviceShortName(config, entry)}</h3>
                    <div className="mt-auto pt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">{copy("pricing.fromLabel")}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-electric-700">{formatGHSFrom(config, price?.amount ?? 0)}</p>
                      <p className="mt-1 text-xs text-mist-500">{price?.unit ?? "one-time"}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Sticky section navigation */}
      <div className="sticky top-[68px] z-30 border-b border-mist-200 bg-white/95 backdrop-blur print:hidden">
        <Container>
          <nav aria-label="Pricing sections" className="flex gap-2 overflow-x-auto py-3 text-sm">
            <a href="#estimate" className="shrink-0 rounded-lg px-3 py-1.5 font-semibold text-electric-700 hover:bg-electric-50">{copy("pricing.navQuickEstimate")}</a>
            <a href="#packages" className="shrink-0 rounded-lg px-3 py-1.5 font-medium text-navy-800 hover:bg-mist-100">{copy("pricing.navAllPackages")}</a>
            {config.groups.map((group) => (
              <a key={group.id} href={`#${group.id}`} className="shrink-0 rounded-lg px-3 py-1.5 font-medium text-navy-800 hover:bg-mist-100">
                {group.shortLabel}
              </a>
            ))}
            <a href="#standard" className="shrink-0 rounded-lg px-3 py-1.5 font-medium text-navy-800 hover:bg-mist-100">{copy("pricing.navTerms")}</a>
            <a href="#faq" className="shrink-0 rounded-lg px-3 py-1.5 font-medium text-navy-800 hover:bg-mist-100">{copy("pricing.navFaq")}</a>
          </nav>
        </Container>
      </div>

      {/* Self-service estimate builder */}
      <Section id="estimate" className="scroll-mt-36 bg-mist-50 py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow={copy("pricing.estimateEyebrow")}
            title={copy("pricing.estimateTitle")}
            intro={copy("pricing.estimateIntro")}
          />
          <PricingEstimator config={config} />
        </Container>
      </Section>

      {/* Full rate card */}
      <Section id="packages" className="scroll-mt-36 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow={copy("pricing.packagesEyebrow")}
            title={copy("pricing.packagesTitle")}
            intro={packagesIntro}
          />

          <div className="space-y-16">
            {config.groups.map((group) => {
              const entries = getPricingGroupServicesFrom(config, group.id);
              return (
                <section key={group.id} id={group.id} className="scroll-mt-40 border-t border-mist-200 pt-14 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric-600">{group.shortLabel}</p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">{group.label}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-mist-600 sm:text-base">{group.description}</p>
                    </div>
                    <Badge tone="blue">{entries.length} {copy("pricing.servicesCountSuffix")}</Badge>
                  </div>

                  <div className="mt-10 space-y-12">
                    {entries.map((entry) => (
                      <ServicePricingBlock key={entry.serviceSlug} entry={entry} config={config} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Pricing standard and commercial terms */}
      <Section id="standard" dark className="scroll-mt-36">
        <Container>
          <SectionHeading
            dark
            eyebrow={copy("pricing.standardEyebrow")}
            title={copy("pricing.standardTitle")}
            intro={copy("pricing.standardIntro")}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {config.rules.map((rule) => (
              <Card key={rule.title} dark className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/15 text-electric-300">
                  <Icon name={rule.icon as IconName} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">{rule.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{rule.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-9 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric-300">{copy("pricing.paymentEyebrow")}</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-white">{copy("pricing.paymentTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-400">{copy("pricing.paymentIntro")}</p>
              <p className="mt-6 rounded-xl border border-white/10 bg-navy-950/50 p-4 text-xs leading-relaxed text-mist-400">
                {effectiveNote}
              </p>
            </div>
            <ul className="space-y-3">
              {config.paymentTerms.map((term, index) => (
                <li key={`${index}-${term.slice(0, 20)}`} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3.5 text-sm leading-relaxed text-mist-200 ring-1 ring-inset ring-white/10">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-electric-300" />
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Simple process */}
      <Section className="bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow={copy("pricing.processEyebrow")}
            title={copy("pricing.processTitle")}
            intro={copy("pricing.processIntro")}
          />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {config.process.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-mist-200 bg-mist-50 p-6">
                <span className="font-display text-2xl font-bold text-electric-600">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-base font-bold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="scroll-mt-36 bg-mist-50 py-16 sm:py-20">
        <Container className="max-w-4xl">
          <SectionHeading
            eyebrow={copy("pricing.faqEyebrow")}
            title={copy("pricing.faqTitle")}
            intro={copy("pricing.faqIntro")}
          />
          <div className="space-y-3">
            {config.faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="group rounded-2xl border border-mist-200 bg-white shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden sm:px-6">
                  {faq.question}
                  <Icon name="chevron-down" className="h-4 w-4 shrink-0 text-electric-600 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-mist-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-mist-600 sm:px-6">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-16 print:hidden sm:py-20">
        <Container>
          <CTABand
            headline={copy("pricing.ctaHeadline")}
            sub={copy("pricing.ctaSub")}
            ctaHref="/start-a-project?type=quotation"
            ctaLabel={copy("pricing.ctaLabel")}
            secondaryHref={copy("pricing.ctaSecondaryHref") || "/contact"}
            secondaryLabel={copy("pricing.ctaSecondaryLabel")}
          />
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}

function ServicePricingBlock({ entry, config }: { entry: ServicePricing; config: PricingConfig }) {
  const copy = (key: string) => pricingCopy(config, key);
  const starting = getServiceStartingPriceFrom(config, entry.serviceSlug);
  const detailsHref = serviceDetailsHref(config, entry);
  const actionHref = serviceActionHref(config, entry);

  return (
    <article id={entry.serviceSlug} className="scroll-mt-44 rounded-3xl border border-mist-200 bg-white p-5 shadow-card sm:p-7 print:break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <ServiceIcon icon={serviceIcon(config, entry)} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">{serviceDisplayName(config, entry)}</h4>
              {starting ? <Badge tone="green">{copy("pricing.fromLabel")} {formatGHSFrom(config, starting.amount)} {starting.unit}</Badge> : null}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-600">{entry.intro}</p>
          </div>
        </div>
        {detailsHref ? (
          <Link href={detailsHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-electric-700 hover:text-electric-600">
            {copy("pricing.serviceDetailsLabel")} <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entry.plans.map((plan) => (
          <PricingPlanCard key={plan.id} plan={plan} config={config} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 rounded-2xl border border-mist-200 bg-mist-50 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h5 className="text-sm font-bold text-navy-900">{copy("pricing.scopeNoteTitle")}</h5>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{entry.note}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {entry.addOns.map((addOn) => (
              <li key={addOn.label} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-mist-700 ring-1 ring-inset ring-mist-200">
                {addOn.label} · {addOnPriceLabelFrom(config, addOn)}{addOn.note ? ` (${addOn.note})` : ""}
              </li>
            ))}
          </ul>
        </div>
        <ButtonLink href={actionHref} variant="secondary" size="sm" className="print:hidden">
          {entry.actionLabel || copy("pricing.startServiceLabel")} <Icon name="arrow-right" className="h-4 w-4" />
        </ButtonLink>
      </div>
    </article>
  );
}

function PricingPlanCard({ plan, config }: { plan: PricingPlan; config: PricingConfig }) {
  const copy = (key: string) => pricingCopy(config, key);
  const href = `/start-a-project?type=quotation&packages=${encodeURIComponent(plan.id)}`;
  return (
    <Card
      hover
      className={classNames(
        "flex h-full flex-col p-5 print:break-inside-avoid sm:p-6",
        plan.featured && "ring-1 ring-electric-300",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h5 className="font-display text-lg font-bold text-navy-900">{plan.name}</h5>
        <div className="flex flex-wrap gap-1.5">
          {plan.featured ? <Badge tone="blue">{copy("pricing.popularLabel")}</Badge> : null}
          <Badge tone={plan.kind === "fixed" ? "green" : "neutral"}>
            {plan.kind === "fixed" ? copy("pricing.fixedBadge") : copy("pricing.fromBadge")}
          </Badge>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-mist-600">{plan.summary}</p>
      <div className="mt-5">
        <p className={classNames("font-display text-3xl font-bold", plan.featured ? "text-electric-700" : "text-navy-900")}>
          {planPriceLabelFrom(config, plan)}
        </p>
        <p className="mt-1 text-xs font-medium text-mist-500">{planUnitLabel(plan)} · {plan.duration}</p>
      </div>
      <ul className="mt-5 flex-1 space-y-2 border-t border-mist-100 pt-5">
        {plan.includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-navy-800">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-xl bg-mist-50 p-3 text-xs leading-relaxed text-mist-600">
        <strong className="text-navy-900">{copy("pricing.bestForLabel")}</strong> {plan.bestFor}
      </p>
      <ButtonLink href={href} size="sm" className="mt-5 w-full print:hidden">
        {copy("pricing.choosePackageLabel")} <Icon name="arrow-right" className="h-4 w-4" />
      </ButtonLink>
    </Card>
  );
}
