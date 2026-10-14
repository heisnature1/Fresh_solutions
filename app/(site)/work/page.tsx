import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, ButtonLink, Card, Badge } from "@/components/ui";
import { CTABand } from "@/components/site/CTABand";
import { getPublishedProjects } from "@/lib/queries";
import { getService, INDUSTRIES } from "@/lib/constants";
import { publicFileUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Our Work",
  description: "Selected projects and case studies from Fresh Solutions.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const projects = await getPublishedProjects(params.category ? { category: params.category } : {});

  // Resolve public image URLs
  const withImages = await Promise.all(
    projects.map(async (p) => {
      const hero = p.images[0];
      const heroUrl = hero ? await publicFileUrl(hero.storageKey) : null;
      return { ...p, heroUrl, heroAlt: hero?.alt ?? "" };
    }),
  );

  const usedCategories = [...new Map(projects.map((p) => [p.category, p.category ? getService(p.category)?.shortName ?? p.category : "Project"])).entries()];

  return (
    <>
      <Section className="bg-navy-950 pb-16 pt-16 text-white">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-300">Our Work</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold">Case studies & project highlights</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist-300">
            Real projects we have delivered — described honestly, without invented claims or names. Outcomes are stated generically unless the client agreed to specifics.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          {usedCategories.length > 1 ? (
            <div className="mb-8 flex flex-wrap gap-2" role="navigation" aria-label="Filter projects by service category">
              <Link href="/work" className={`chip ${!params.category ? "chip-active" : ""}`}>All</Link>
              {usedCategories.map(([slug, name]) => (
                <Link key={slug} href={`/work?category=${slug}`} className={`chip ${params.category === slug ? "chip-active" : ""}`}>{name}</Link>
              ))}
            </div>
          ) : null}

          {withImages.length === 0 ? (
            <div className="rounded-2xl border border-mist-200 bg-white px-6 py-16 text-center shadow-card">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric-100">
                <svg className="h-7 w-7 text-electric-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7.5H4a1 1 0 0 0-1 1V17a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 17V8.5a1 1 0 0 0-1-1.5ZM3.5 7.5V6A1.5 1.5 0 0 1 5 4.5h4L11 6.5h9.5" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-navy-900">Case studies are being prepared</h2>
              <p className="mx-auto mt-2 max-w-md text-mist-600">
                We publish only completed, real client work. Our first case studies are being written up now — check back soon, or ask us directly what we've been working on.
              </p>
              <ButtonLink href="/start-a-project" className="mt-6">Discuss your project</ButtonLink>
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {withImages.map((p) => (
                <Link key={p.id} href={`/work/${p.slug}`} className="group">
                  <Card className="flex h-full flex-col p-0 transition-transform duration-300 group-hover:-translate-y-1.5">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-navy-100">
                      {p.heroUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- image URL is storage-backed (local object store or S3); Next image domains are not knowable at build time
                        <img src={p.heroUrl} alt={p.heroAlt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="grid-lines flex h-full w-full items-center justify-center bg-navy-900">
                          <svg className="h-10 w-10 text-electric-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 5.8v5.4c0 4.5 3 7.8 7 9.3 4-1.5 7-4.8 7-9.3V5.8L12 3Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.3 11.8 1.9 1.9 3.6-3.7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2">
                        <Badge tone="blue">{p.category ? getService(p.category)?.shortName ?? "Project" : "Project"}</Badge>
                        {p.publishedAt ? <span className="text-xs text-mist-500">{formatDate(p.publishedAt)}</span> : null}
                      </div>
                      <h2 className="mt-3 font-display text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-electric-600">{p.title}</h2>
                      {p.summary ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist-600">{p.summary}</p> : null}
                      <span className="mt-auto pt-4 text-sm font-semibold text-electric-600">Read case study →</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <CTABand headline="Want results like these?" sub="Tell us about your project — we'll scope it with you." ctaHref="/start-a-project" ctaLabel="Start a project" />
        </Container>
      </Section>
    </>
  );
}
