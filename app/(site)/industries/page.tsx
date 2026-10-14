import type { Metadata } from "next";
import { INDUSTRIES, SERVICES } from "@/lib/constants";
import { PageHero, Container, Section, SectionHeading, Card, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Fresh Solutions serves individuals, small and large businesses, schools and universities, nonprofits, and institutions — with technology, engineering, repair, and consultancy services shaped to each.",
};

const INDUSTRY_NEEDS: Record<string, string[]> = {
  individuals: ["Device repairs and upgrades", "Personal tech support and setup", "Digital skills training"],
  "small-medium-businesses": ["Business websites and systems", "Practical IT support arrangements", "Workflow automation and tools"],
  "large-businesses": ["Custom software and integrations", "Authorised security assessments", "Technology strategy and delivery"],
  "schools-universities": ["Computer literacy and ICT training", "Management systems for records", "Lab, network, and device support"],
  nonprofits: ["Budget-conscious digital presence", "Data and records tooling", "Team technology training"],
  institutions: ["Secure, documented systems", "Process digitisation", "Dependable support arrangements"],
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Who we work with"
        intro="Different audiences need different things from technology. We shape every engagement around the people it serves — and we only claim the work we've actually done."
      />
      <Section>
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind, i) => (
              <Reveal key={ind.slug} delay={(i % 3) * 60}>
                <Card hover className="flex h-full flex-col p-6">
                  <h2 className="font-display text-lg font-bold text-navy-900">{ind.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600">{ind.description}</p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {(INDUSTRY_NEEDS[ind.slug] ?? []).map((need) => (
                      <li key={need} className="flex items-start gap-2 text-sm text-mist-700">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
                        {need}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href="/start-a-project" variant="outline" size="sm" className="mt-5 self-start">
                    Discuss your needs <Icon name="arrow-right" className="h-3.5 w-3.5" />
                  </ButtonLink>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-16">
            <SectionHeading
              eyebrow="How we can help"
              title="Services matched to your world"
              intro="Every service we offer can be tailored to your type of organisation."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.slice(0, 9).map((s) => (
                <a key={s.slug} href={s.isRepairService ? "/repairs" : `/solutions/${s.slug}`} className="rounded-xl border border-mist-200 bg-white px-5 py-4 text-sm font-semibold text-navy-900 transition-all hover:border-electric-300 hover:text-electric-700">
                  {s.shortName}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
