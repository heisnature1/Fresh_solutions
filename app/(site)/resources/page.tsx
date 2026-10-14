import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CTABand } from "@/components/site/CTABand";
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
      <Section className="bg-navy-950 pb-14 pt-16 text-white">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric-300">Resources</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold">Knowledge centre</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist-300">
            Practical, honest guidance — no filler. Written from real project and repair experience.
          </p>
          <form method="get" action="/resources" className="mt-7 max-w-xl">
            <label htmlFor="rs-q" className="sr-only">Search articles</label>
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist-400" />
              <input
                id="rs-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search articles, guides, topics…"
                className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-32 text-white placeholder:text-mist-400 focus:border-electric-400 focus:outline-none focus:ring-2 focus:ring-electric-400/40"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-electric-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-electric-500">
                Search
              </button>
            </div>
            {categorySlug ? (
              <input type="hidden" name="category" value={categorySlug} />
            ) : null}
          </form>
        </Container>
      </Section>

      <Section>
        <Container>
          {categories.length > 0 ? (
            <div className="mb-8 flex flex-wrap gap-2" role="navigation" aria-label="Filter by category">
              <Link href={q ? `/resources?q=${encodeURIComponent(q)}` : "/resources"} className={`chip ${!categorySlug ? "chip-active" : ""}`}>All</Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/resources?${new URLSearchParams({ ...(q ? { q } : {}), category: c.slug })}`}
                  className={`chip ${categorySlug === c.slug ? "chip-active" : ""}`}
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
              <Link href="/resources" className="ml-2 font-semibold text-electric-700 underline underline-offset-2">Clear search</Link>
            </p>
          ) : null}

          {articles.length === 0 && !q ? (
            <div className="rounded-2xl border border-mist-200 bg-white px-6 py-16 text-center shadow-card">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric-100">
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
              <h2 className="font-display text-lg font-bold text-navy-900">Nothing found</h2>
              <p className="mx-auto mt-2 max-w-md text-mist-600">
                We don't publish content just to fill the page — try a different term, or ask us your question directly.
              </p>
              <Link href="/contact" className="mt-5 inline-block rounded-xl bg-electric-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-electric-500">
                Ask us directly
              </Link>
            </div>
          ) : null}

          {featured ? (
            <Link href={`/resources/${featured.slug}`} className="group mb-10 block">
              <div className="overflow-hidden rounded-2xl border border-mist-200 bg-gradient-to-br from-navy-900 to-navy-950 shadow-card transition-shadow hover:shadow-card-lg">
                <div className="grid md:grid-cols-[200px_1fr]">
                  <div className="grid-lines hidden items-center justify-center md:flex">
                    <Icon name="book" className="h-14 w-14 text-electric-400/70" />
                  </div>
                  <div className="p-8 text-white">
                    <Badge tone="blue">Featured</Badge>
                    <h2 className="mt-3 font-display text-2xl font-extrabold transition-colors group-hover:text-electric-300">{featured.title}</h2>
                    {featured.excerpt ? <p className="mt-3 leading-relaxed text-mist-300">{featured.excerpt}</p> : null}
                    <p className="mt-4 text-sm text-mist-400">
                      {featured.publishedAt ? formatDate(featured.publishedAt) : ""}{featured.categoryName ? ` · ${featured.categoryName}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          {rest.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Link key={a.id} href={`/resources/${a.slug}`} className="group">
                  <Card className="flex h-full flex-col transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {a.categoryName ? <Badge tone="slate">{a.categoryName}</Badge> : null}
                      {a.publishedAt ? <span className="text-mist-500">{formatDate(a.publishedAt)}</span> : null}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-electric-600">{a.title}</h2>
                    {a.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist-600">{a.excerpt}</p> : null}
                    <span className="mt-auto pt-4 text-sm font-semibold text-electric-600">Read →</span>
                  </Card>
                </Link>
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
