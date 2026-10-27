import type { Metadata } from "next";
import { SERVICES } from "@/lib/constants";
import { ServiceCard } from "@/components/site/ServiceCard";
import { PageHero, Container, Section, SectionHeading, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "All Fresh Solutions services: web & software development, mobile apps, cybersecurity, AI & automation, IT services, cloud & hosting, training, hardware, consultancy, and appliance repairs.",
};

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Everything we can help you build, secure, fix, and improve"
        intro="Eleven service areas, one careful team. Compare published Ghana-cedi prices before you get in touch, then choose the service that fits your needs."
      >
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/pricing" size="lg">
            View pricing in GHS <Icon name="arrow-right" className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink href="/pricing#estimate" variant="dark" size="lg">
            Build an estimate
          </ButtonLink>
        </div>
      </PageHero>
      <Section>
        <Container>
          <SectionHeading eyebrow="Service directory" title="Our full range of services" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
