import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CTABand } from "@/components/site/CTABand";
import { Reveal } from "@/components/site/Reveal";
import { searchArticles } from "@/lib/queries";
import { getDb, schema } from "@/lib/db/client";
import { asc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Resources & Knowledge Centre",
  description: "Guides, articles, and downloads from Fresh Solutions — practical help on software, security, AI, IT, and repairs.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const categorySlug = params.category ?? "";

  const [{ articles }, categories] = await Promise.all([
    searchArticles({ q: q || undefined, categorySlug: categorySlug || undefined, perPage: 12 }),
    (async () => {
      const db = await getDb();
      return db.select().from(schema.articleCategories).orderBy(asc(schema.articleCategories.name));
    })(),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const withCategory = articles.map((a) => ({ ...a, categoryName: a.categoryId ? categoryById.get(a.categoryId) ?? null : null }));

  const featured = !q && !categorySlug ? withCategory.find((a) => a.featured) ?? null : null;
  const rest = featured ? withCategory.filter((a) => a.id !== featured.id) : withCategory;

  return (
    <>
      {/* Hero with animated background */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="animate-float-slow absolute -left-24 -top-24 h-72 w-72 rounded-full bg-electric-600/25 blur-[110px]" aria-hidden />
        <div className="animate-float absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-sky-400/15 blur-[100px]" aria-hidden />

        <Container className="relative pb-14 pt-16 sm:pb-16 sm:pt-20">
          <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.22em] text-electric-300">Resources</p>
          <h1 className="animate-fade-up mt-3 max-w-3xl font-display text-5xl font-extrabold" style={{ animationDelay: "90ms" }}>
            Knowledge <span className="text-gradient animate-gradient-pan">centre</span>
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl text-lg leading-relaxed text-mist-300" style={{ animationDelay: "180ms" }}>
            Practical, honest guidance — no filler. Written from real project and repair experience.
          </p>
          <form method="get" action="/resources" className="animate-fade-up mt-7 max-w-xl" style={{ animationDelay: "280ms" }}>
            <label htmlFor="rs-q" className="sr-only">Search articles</label>
            <div className="relative transition-transform duration-200 focus-within:-translate-y-0.5">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist-400" />
              <input
                id="rs-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search articles, guides, topics…"
                className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-32 text-white placeholder:text-mist-400 transition-all focus:border-electric-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-electric-400/40"
              />
              <button type="submit" className="btn-shine absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-electric-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-electric-500">
                Search
              </button>
            </div>
            {categorySlug ? (
              <input type="hidden" name="category" value={categorySlug} />
            ) : null}
          </form>
        </Container>
      </section>

      <Section>
        <Container>
          {categories.length > 0 ? (
            <div className="mb-8 flex flex-wrap gap-2" role="navigation" aria-label="Filter by category">
              <Link href={q ? `/resources?q=${encodeURIComponent(q)}` : "/resources"} className={`chip transition-all duration-200 hover:-translate-y-0.5 ${!categorySlug ? "chip-active" : ""}`}>All</Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/resources?${new URLSearchParams({ ...(q ? { q } : {}), category: c.slug })}`}
                  className={`chip transition-all duration-200 hover:-translate-y-0.5 ${categorySlug === c.slug ? "chip-active" : ""}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null}

          {q ? (
            <p className="mb-8 text-mist-600">
              {articles.length === 0 ? "No results" : `${articles.length} result${articles.length === 1 ? "" : "s"}`} for <strong className="text-navy-900">“{q}”</strong>
              {categorySlug ? " in this category" : ""}.
              <Link href="/resources" className="link-underline ml-2 font-semibold text-electric-700">Clear search</Link>
            </p>
          ) : null}

          {articles.length === 0 && !q ? (
            <div className="rounded-2xl border border-mist-200 bg-white px-6 py-16 text-center shadow-card">
              <div className="animate-float mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric-100">
                <Icon name="book" className="h-7 w-7 text-electric-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-navy-900">Articles coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-mist-600">
                We're writing our first guides based on real client work and repair experience. Check back soon.
              </p>
            </div>
          ) : null}

          {articles.length === 0 && q ? (
            <div className="rounded-2xl border border-mist-200 bg-white px-6 py-12 text-center shadow-card">
              <div className="animate-float mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-mist-100">
                <Icon name="search" className="h-6 w-6 text-mist-400" />
              </div>
              <h2 className="font-display text-lg font-bold text-navy-900">Nothing found</h2>
              <p className="mx-auto mt-2 max-w-md text-mist-600">
                We don't publish content just to fill the page — try a different term, or ask us your question directly.
              </p>
              <Link href="/contact" className="btn-shine mt-5 inline-block rounded-xl bg-electric-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-electric-500">
                Ask us directly
              </Link>
            </div>
          ) : null}

          {featured ? (
            <Reveal>
              <Link href={`/resources/${featured.slug}`} className="group mb-10 block">
                <div className="card-sheen overflow-hidden rounded-2xl border border-mist-200 bg-gradient-to-br from-navy-900 to-navy-950 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-lg">
                  <div className="grid md:grid-cols-[200px_1fr]">
                    <div className="grid-lines hidden items-center justify-center md:flex">
                      <Icon name="book" className="h-14 w-14 text-electric-400/70 transition-transform duration-500 group-hover:scale-110 group-hover:text-electric-300" />
                    </div>
                    <div className="p-8 text-white">
                      <Badge tone="blue">Featured</Badge>
                      <h2 className="mt-3 font-display text-2xl font-extrabold transition-colors group-hover:text-electric-300">{featured.title}</h2>
                      {featured.excerpt ? <p className="mt-3 leading-relaxed text-mist-300">{featured.excerpt}</p> : null}
                      <p className="mt-4 flex items-center gap-1.5 text-sm text-mist-400">
                        {featured.publishedAt ? formatDate(featured.publishedAt) : ""}{featured.categoryName ? ` · ${featured.categoryName}` : ""}
                        <Icon name="arrow-right" className="h-4 w-4 text-electric-400 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ) : null}

          {rest.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i, 5) * 70}>
                  <Link href={`/resources/${a.slug}`} className="group block h-full">
                    <Card className="card-lift flex h-full flex-col">
                      <div className="flex items-center gap-2 text-xs">
                        {a.categoryName ? <Badge tone="slate">{a.categoryName}</Badge> : null}
                        {a.publishedAt ? <span className="text-mist-500">{formatDate(a.publishedAt)}</span> : null}
                      </div>
                      <h2 className="mt-3 font-display text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-electric-600">{a.title}</h2>
                      {a.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist-600">{a.excerpt}</p> : null}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-electric-600 transition-all duration-200 group-hover:gap-2.5">
                        Read <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <CTABand headline="Can't find the answer?" sub="Reach out — we respond to real questions, not ticket queues." ctaHref="/contact" ctaLabel="Ask us a question" />
        </Container>
      </Section>
    </>
  );
}
