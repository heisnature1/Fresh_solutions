import type { Metadata } from "next";
import { Container, Section, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CTABand } from "@/components/site/CTABand";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who Fresh Solutions is, how we think, and what we build.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: "shield",
    title: "Honesty over flash",
    body: "No inflated claims, no stock-photo 'case studies', no invented client logos. If something isn't real, it doesn't go on this site. That principle drives everything you see here.",
  },
  {
    icon: "wrench",
    title: "Practical engineering",
    body: "We build things that work and keep working — software people actually use, security controls that actually hold, repairs done properly the first time, with the diagnosis in writing.",
  },
  {
    icon: "sparkles",
    title: "Current, not trendy",
    body: "We invest in modern, relevant capability — AI, cloud, modern engineering practice — because our clients' problems deserve it. But we recommend it only when it is genuinely the right tool.",
  },
  {
    icon: "heart",
    title: "Businesses we serve",
    body: "Small and growing organisations often get enterprise talk without enterprise results. We take your constraints seriously: budget, capacity, timelines, and the need to keep the lights on.",
  },
];

const CAPABILITIES = [
  "Custom web applications & platforms",
  "Security assessments & hardening",
  "Practical AI integrations",
  "IT support & managed services",
  "Device diagnostics & component repairs",
  "Business & technology consulting",
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <Section className="bg-navy-950 pb-16 pt-16 text-white">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-300">About Fresh Solutions</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold">A tech partner that tells you the truth</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist-300">
            {settings.companyDescription}
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <Badge tone="blue">Our principles</Badge>
              <h2 className="mb-8 mt-4 font-display text-3xl font-extrabold text-navy-900">What we stand for</h2>
              <div className="space-y-4">
                {PRINCIPLES.map((p) => (
                  <Card key={p.title} className="flex gap-4 p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-electric-100 text-electric-700">
                      <Icon name={p.icon} className="h-5.5 w-5.5" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold text-navy-900">{p.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{p.body}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:pl-6">
              <Badge tone="blue">What we do</Badge>
              <h2 className="mb-8 mt-4 font-display text-3xl font-extrabold text-navy-900">One team, broad capability</h2>
              <div className="rounded-2xl border border-mist-200 bg-white p-7 shadow-card">
                <p className="leading-relaxed text-mist-600">
                  Fresh Solutions spans the full stack of modern technology problems: the software on your screen, the
                  security on your systems, the intelligence in your data, and the physical devices on your desk. Most
                  tech companies hand one of these to you and point you elsewhere for the rest — we own the whole problem.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {CAPABILITIES.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-sm text-mist-700">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-mist-50 p-4 text-sm text-mist-600">
                  <p className="font-semibold text-navy-900">A note on credentials</p>
                  <p className="mt-1">
                    We list specific certifications and memberships here only when we hold them. For now, this line is
                    intentionally unpadded — ask us directly and we'll tell you exactly what we carry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <CTABand headline="Let's work together" sub="Start with a conversation — no obligation, no jargon." ctaHref="/start-a-project" ctaLabel="Start a project" />
        </Container>
      </Section>
    </>
  );
}
