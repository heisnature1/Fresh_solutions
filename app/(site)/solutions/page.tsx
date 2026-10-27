import type { Metadata } from "next";
import { SERVICES } from "@/lib/constants";
import { ServiceCard } from "@/components/site/ServiceCard";
import { PageHero, Container, Section, SectionHeading, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getPricingConfig } from "@/lib/pricing-store";
import { pricingCopy } from "@/lib/pricing-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "All Fresh Solutions services: web & software development, mobile apps, cybersecurity, AI & automation, IT services, cloud & hosting, training, hardware, consultancy, and appliance repairs.",
};

export default async function SolutionsPage() {
  const pricing = await getPricingConfig();
  const copy = (key: string) => pricingCopy(pricing, key);

  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Everything we can help you build, secure, fix, and improve"
        intro={copy("pricing.solutionsIntro")}
      >
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/pricing" size="lg">
            {copy("pricing.solutionsPricingCta")} <Icon name="arrow-right" className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink href="/pricing#estimate" variant="dark" size="lg">
            {copy("pricing.solutionsEstimateCta")}
          </ButtonLink>
        </div>
      </PageHero>
      <Section>
        <Container>
          <SectionHeading eyebrow="Service directory" title="Our full range of services" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <ServiceCard key={s.slug} service={s} pricing={pricing} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
