import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero, Container, Section, Badge, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getService } from "@/lib/constants";
import {
  buildEstimateBrief,
  buildEstimateTitle,
  estimateHasStartingPrice,
  estimateTotal,
  formatGHS,
  getPricingPlans,
  planPriceLabel,
  planUnitLabel,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Tell Fresh Solutions about your project — software, security, AI, engineering, training, or consultancy — and receive a clear, honest response.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  return (first(value) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default async function StartAProjectPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const packageIds = list(params.packages);
  const selectedPlans = getPricingPlans(packageIds);
  const requestedServices = list(params.services).filter((slug) => Boolean(getService(slug)));
  const initialServices = Array.from(new Set([...requestedServices, ...selectedPlans.map((plan) => plan.serviceSlug)]));
  const legacyService = first(params.service);
  if (legacyService && getService(legacyService) && !initialServices.includes(legacyService)) {
    initialServices.push(legacyService);
  }

  const kind = first(params.type) === "quotation" || selectedPlans.length > 0 ? "quotation" : "project";
  const total = estimateTotal(selectedPlans);
  const hasStartingPrice = estimateHasStartingPrice(selectedPlans);
  const brief = buildEstimateBrief(selectedPlans);
  const title = buildEstimateTitle(selectedPlans);

  return (
    <>
      <PageHero
        eyebrow="Start a project"
        title="Tell us what you're working toward"
        intro={
          selectedPlans.length > 0
            ? "Your chosen packages are below. Add a few details and we will confirm the scope and final GHS quotation in writing."
            : "Six quick steps. No account needed, no obligation — just a clear reference and a real response from our team."
        }
      />
      <Section className="pt-10 sm:pt-12">
        <Container className="max-w-3xl">
          {selectedPlans.length > 0 ? (
            <div className="mb-8 rounded-2xl border border-electric-200 bg-electric-50 p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge tone="blue">Selected from pricing guide</Badge>
                  <h2 className="mt-3 font-display text-xl font-bold text-navy-900">Your chosen packages</h2>
                </div>
                <Link href="/pricing#estimate" className="inline-flex items-center gap-1.5 text-sm font-semibold text-electric-700 hover:text-electric-600">
                  Change selection <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
              </div>
              <ul className="mt-5 space-y-2">
                {selectedPlans.map((plan) => (
                  <li key={plan.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-inset ring-electric-100">
                    <span className="font-medium text-navy-900">
                      <span className="text-mist-500">{getService(plan.serviceSlug)?.shortName ?? plan.serviceSlug} — </span>
                      {plan.name}
                    </span>
                    <span className="font-semibold text-electric-700">
                      {planPriceLabel(plan)} <span className="font-normal text-mist-500">{planUnitLabel(plan)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-electric-200 pt-4">
                <div>
                  <p className="text-sm font-semibold text-navy-900">Indicative published total</p>
                  <p className="mt-0.5 text-xs text-mist-600">
                    {hasStartingPrice ? "Minimum estimate" : "Published package total"} · Recurring items count for one billing period.
                  </p>
                </div>
                <p className="font-display text-2xl font-bold text-navy-900">
                  {formatGHS(total)}{hasStartingPrice ? "+" : ""}
                </p>
              </div>
              <p className="mt-4 rounded-xl bg-white/70 p-3 text-xs leading-relaxed text-mist-600">
                This is an indication, not an invoice. Taxes, third-party costs, scope changes, and payment milestones
                are confirmed in a written quotation before any work begins.
              </p>
            </div>
          ) : null}

          <InquiryForm
            initialService={initialServices[0]}
            initialServices={initialServices}
            initialKind={kind}
            initialTitle={title}
            initialBrief={brief}
          />
          <div className="mt-8 text-center print:hidden">
            <ButtonLink href="/pricing" variant="outline" size="sm">
              <Icon name="file-text" className="h-4 w-4" /> View pricing guide
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
