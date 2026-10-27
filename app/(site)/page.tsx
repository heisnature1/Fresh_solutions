import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/site/Hero";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { CTABand } from "@/components/site/CTABand";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container, Section, SectionHeading, Card, ButtonLink, EmptyState, Badge } from "@/components/ui";
import { Icon, ServiceIcon } from "@/components/icons";
import {
  SERVICES,
  INDUSTRIES,
  SITE_NAME,
  SITE_TAGLINE,
  getService,
} from "@/lib/constants";
import { getFeaturedProjects, getLatestArticles, getApprovedTestimonials } from "@/lib/queries";
import { getSettings, whatsappLink } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Fresh Solutions: web & software development, cybersecurity, AI & automation, IT support, engineering, appliance repairs, and business consultancy.",
};

const WHY_POINTS = [
  { icon: "tool", title: "Practical problem-solving", text: "We start from your problem, not from a product we want to sell — and we recommend the simplest solution that genuinely works." },
  { icon: "award", title: "Quality workmanship", text: "Careful engineering, clean code, tidy wiring, documented work. We build things we are happy to put our name on." },
  { icon: "shield", title: "Responsible technology", text: "We advise honestly — including when technology is not the answer — and we only promise capabilities we have actually implemented." },
  { icon: "lock", title: "Security-conscious development", text: "Security is designed in from the first sketch: least privilege, validated inputs, encrypted secrets, and tested defences." },
  { icon: "mail", title: "Clear communication", text: "Plain-language explanations, written references for every request, and updates you do not have to chase." },
  { icon: "heart", title: "Customer-focused service", text: "From a kettle repair to a company-wide platform, every job receives the same careful, respectful service." },
];

const REPAIR_HIGHLIGHTS = [
  { icon: "smartphone", title: "Mobile phone repairs", text: "Charging faults, battery problems, screen damage assessment, software troubleshooting." },
  { icon: "circuit", title: "Laptop & computer repairs", text: "Hardware diagnosis, power faults, storage and memory, keyboards and displays." },
  { icon: "tool", title: "Kettles & small appliances", text: "Power and heating faults, switches, cords and plugs — checked safely and honestly." },
];

export default async function HomePage() {
  const [settings, featured, articles, testimonials] = await Promise.all([
    getSettings(),
    getFeaturedProjects(3).catch(() => []),
    getLatestArticles(3).catch(() => []),
    getApprovedTestimonials({ limit: 6 }).catch(() => []),
  ]);
  const wa = whatsappLink(settings.contactWhatsapp, "Hello Fresh Solutions — I'd like to make an enquiry.");
  const repairService = getService("appliance-repairs")!;

  return (
    <>
      <Hero />

      {/* Services overview */}
      <Section id="solutions">
        <Container>
          <SectionHeading
            eyebrow="What we do"
            title="One team across technology, engineering, and repairs"
            intro="From software and security to hands-on electronics repair, Fresh Solutions brings practical expertise under one roof."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 60}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Transparent pricing CTA */}
      <Section className="bg-white py-14 sm:py-16">
        <Container>
          <CTABand
            headline="Know the price before you call"
            sub="Every service has a published Ghana-cedi starting price, package limits, optional extras, and payment terms. Build an estimate or choose a package on your own time."
            ctaHref="/pricing"
            ctaLabel="View pricing in GHS"
          />
        </Container>
      </Section>

      {/* Repairs spotlight */}
      <Section dark className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-electric-600/15 blur-[110px]" aria-hidden />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                dark
                eyebrow="Repairs"
                title="Electrical & electronic appliance repairs"
                intro="Mobile phones, laptops, kettles, and other appliances — carefully diagnosed and honestly assessed before any work begins. Mains-voltage work is handled only by suitably qualified people."
              />
              <div className="flex flex-wrap gap-3.5">
                <ButtonLink href="/repairs/request" size="lg">
                  <Icon name="tool" className="h-5 w-5" />
                  Request a Repair
                </ButtonLink>
                <ButtonLink href="/repairs" variant="dark" size="lg">
                  How repairs work
                </ButtonLink>
              </div>
              <p className="mt-5 text-sm text-mist-400">
                You receive a unique repair reference for every request — no account needed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              {REPAIR_HIGHLIGHTS.map((r, i) => (
                <Reveal key={r.title} delay={i * 80}>
                  <Card dark className="flex items-start gap-4 p-5">
                    <ServiceIcon icon={r.icon} />
                    <div>
                      <h3 className="font-display font-bold text-white">{r.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-mist-400">{r.text}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Industries */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Who we serve"
            title="Built for individuals, businesses, and institutions"
            intro="We shape each engagement around the audience in front of us — no exaggerated claims, just careful work for whoever needs it."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind, i) => (
              <Reveal key={ind.slug} delay={(i % 3) * 60}>
                <Card hover className="h-full p-6">
                  <h3 className="font-display text-base font-bold text-navy-900">{ind.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600">{ind.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured work — real projects only, honest empty state */}
      <Section className="bg-white">
        <Container>
          <SectionHeading
            eyebrow="Our work"
            title="Featured projects"
            intro="Selected work published by our team. We only showcase projects that genuinely exist."
          />
          {featured.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Icon name="layers" className="h-6 w-6" />}
              title="Projects are on the way"
              message="We publish case studies only for work that has been genuinely completed and approved. Check back soon — or become one of our first featured clients."
              action={<ButtonLink href="/start-a-project">Start a Project</ButtonLink>}
            />
          )}
          {featured.length > 0 ? (
            <div className="mt-10 text-center">
              <ButtonLink href="/work" variant="outline">
                Browse all work <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Why Fresh Solutions */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Why Fresh Solutions"
            title="How we work"
            intro="Six commitments behind every project, repair, and consultation we take on."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_POINTS.map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) * 60}>
                <div className="h-full rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
                  <ServiceIcon icon={w.icon} />
                  <h3 className="mt-4 font-display text-base font-bold text-navy-900">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Knowledge centre preview */}
      {articles.length > 0 ? (
        <Section className="bg-white">
          <Container>
            <SectionHeading
              eyebrow="Knowledge centre"
              title="Latest from the team"
              intro="Articles, guides, and announcements from Fresh Solutions."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/resources/${a.slug}`} className="group">
                  <Card hover className="h-full p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-electric-600">
                      {a.publishedAt ? formatDate(a.publishedAt) : ""}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy-900 group-hover:text-electric-700">
                      {a.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist-600">{a.excerpt}</p>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <ButtonLink href="/resources" variant="outline">
                Visit the knowledge centre <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Testimonials — hidden entirely until genuine approved reviews exist */}
      {testimonials.length > 0 ? (
        <Section dark>
          <Container>
            <SectionHeading dark eyebrow="Testimonials" title="What clients say" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id} dark className="flex h-full flex-col p-6">
                  {t.rating ? (
                    <div className="mb-3 flex gap-0.5 text-amber-400" aria-label={`Rated ${t.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon key={i} name="star" className={`h-4 w-4 ${i < (t.rating ?? 0) ? "" : "opacity-25"}`} />
                      ))}
                    </div>
                  ) : null}
                  <blockquote className="flex-1 text-sm leading-relaxed text-mist-200">“{t.content}”</blockquote>
                  <footer className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    {t.role || t.organisation ? (
                      <p className="text-xs text-mist-400">{[t.role, t.organisation].filter(Boolean).join(" · ")}</p>
                    ) : null}
                  </footer>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Contact */}
      <Section id="contact" className="bg-gradient-to-b from-mist-50 to-white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Talk to us about what you need"
                intro="Send a message, start a project, request a repair — or reach us directly using the details below."
              />
              <ul className="space-y-4">
                {settings.contactEmail ? (
                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600"><Icon name="mail" className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Email</p>
                      <a className="text-sm text-electric-700 underline-offset-2 hover:underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                    </div>
                  </li>
                ) : null}
                {settings.contactPhone ? (
                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600"><Icon name="phone" className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Telephone</p>
                      <a className="text-sm text-electric-700 underline-offset-2 hover:underline" href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`}>{settings.contactPhone}</a>
                    </div>
                  </li>
                ) : null}
                {settings.contactLocation ? (
                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600"><Icon name="map-pin" className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Location</p>
                      <p className="text-sm text-mist-600">{settings.contactLocation}</p>
                    </div>
                  </li>
                ) : null}
                {settings.businessHours ? (
                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600"><Icon name="clock" className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Business hours</p>
                      <p className="text-sm text-mist-600">{settings.businessHours}</p>
                    </div>
                  </li>
                ) : null}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {wa ? (
                  <ButtonLink href={wa} external variant="whatsapp">
                    <Icon name="whatsapp" className="h-5 w-5" /> WhatsApp us
                  </ButtonLink>
                ) : null}
                <ButtonLink href="/start-a-project" variant="secondary">
                  Start a Project <Icon name="arrow-right" className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
            <Card className="p-6 sm:p-8">
              <ContactForm />
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
