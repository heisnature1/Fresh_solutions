import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getService, SERVICES } from "@/lib/constants";
import { Container, Section, Card, ButtonLink, PageHero } from "@/components/ui";
import { Icon, ServiceIcon } from "@/components/icons";
import { Reveal } from "@/components/site/Reveal";

export function generateStaticParams() {
  return SERVICES.filter((s) => !s.isRepairService).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.summary,
    openGraph: { title: `${service.name} | Fresh Solutions`, description: service.summary },
    alternates: { canonical: `/solutions/${service.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  if (service.isRepairService) redirect("/repairs");

  const others = SERVICES.filter((s) => s.slug !== service.slug && !s.isRepairService).slice(0, 3);

  return (
    <>
      <PageHero eyebrow="Solutions" title={service.name} intro={service.description}>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href={`/start-a-project?service=${service.slug}`} size="lg">
            {service.cta} <Icon name="arrow-right" className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink href={`/start-a-project?service=${service.slug}&type=quotation`} variant="dark" size="lg">
            Request a Quotation
          </ButtonLink>
        </div>
      </PageHero>

      {service.slug === "cybersecurity" ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <Container className="flex items-start gap-3 py-4">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-900">
              <strong>Authorisation required.</strong> Security testing is only ever performed with the documented,
              written authorisation of the system owner. We do not test systems we are not explicitly permitted to assess.
            </p>
          </Container>
        </div>
      ) : null}

      <Section>
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 60}>
                <Card hover className="h-full p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric-600/10 text-sm font-bold text-electric-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-navy-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600">{f.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-8 rounded-3xl border border-mist-200 bg-gradient-to-br from-navy-900 to-navy-800 p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to talk about {service.shortName.toLowerCase()}?</h2>
              <p className="mt-3 max-w-xl text-mist-300">
                Tell us about your situation and goals. We'll respond with an honest assessment and, where it makes
                sense, a clear proposal or quotation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/start-a-project?service=${service.slug}`} size="lg">
                {service.cta} <Icon name="arrow-right" className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="dark" size="lg">Contact us</ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <h2 className="mb-6 font-display text-xl font-bold text-navy-900">Explore more services</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-mist-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-electric-300 hover:shadow-card-lg"
              >
                <ServiceIcon icon={s.icon} />
                <div>
                  <p className="font-semibold text-navy-900 group-hover:text-electric-700">{s.shortName}</p>
                  <p className="text-xs text-mist-500">{s.tagline}</p>
                </div>
                <Icon name="arrow-right" className="ml-auto h-4 w-4 text-mist-400 transition-transform group-hover:translate-x-1 group-hover:text-electric-600" />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.name,
            description: service.summary,
            provider: { "@type": "Organization", name: "Fresh Solutions" },
          }),
        }}
      />
    </>
  );
}
