import type { Metadata } from "next";
import { SERVICES } from "@/lib/constants";
import { ServiceCard } from "@/components/site/ServiceCard";
import { PageHero, Container, Section, SectionHeading } from "@/components/ui";

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
        intro="Eleven service areas, one careful team. Explore what we offer and start a conversation — every engagement begins with understanding your actual problem."
      />
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
