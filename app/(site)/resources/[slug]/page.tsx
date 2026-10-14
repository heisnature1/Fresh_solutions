import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container, Section, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CTABand } from "@/components/site/CTABand";
import { Reveal } from "@/components/site/Reveal";
import { ReadingProgress, CopyLinkButton } from "@/components/site/interactive";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || `${article.title} — a guide from Fresh Solutions.`,
    alternates: { canonical: `/resources/${article.slug}` },
    openGraph: { title: article.title, description: article.excerpt ?? undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.categoryId, 3);
  // Real reading time derived from the actual article body (≈200 words/min).
  const minutes = Math.max(1, Math.round(article.content.trim().split(/\s+/).length / 200));

  return (
    <>
      <ReadingProgress />
      <Section className="bg-navy-950 pb-14 pt-16 text-white">
        <Container>
          <Link href="/resources" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-mist-300 transition-all hover:gap-2.5 hover:text-white">
            <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" /> Resources
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            {article.category ? <Badge tone="blue">{article.category.name}</Badge> : null}
            {article.publishedAt ? <span className="text-mist-400">{formatDate(article.publishedAt)}</span> : null}
            <span className="inline-flex items-center gap-1.5 text-mist-400">
              <Icon name="clock" className="h-3.5 w-3.5" /> {minutes} min read
            </span>
            {article.authorName ? <span className="text-mist-300">By {article.authorName}</span> : null}
            <span className="ml-auto"><CopyLinkButton /></span>
          </div>
          <h1 className="animate-fade-up mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl" style={{ animationDelay: "80ms" }}>{article.title}</h1>
          {article.excerpt ? <p className="animate-fade-up mt-4 max-w-2xl text-lg leading-relaxed text-mist-300" style={{ animationDelay: "180ms" }}>{article.excerpt}</p> : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <article className="article-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            </article>

            {article.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-mist-200 pt-8">
                {article.tags.map((t) => (
                  <span key={t.id} className="chip">{t.name}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-10 rounded-2xl bg-navy-900 p-7 text-white">
              <h2 className="font-display text-lg font-bold">Was this useful?</h2>
              <p className="mt-1.5 text-sm text-mist-300">
                If you're facing this exact problem, we can help you solve it — properly, the first time.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/contact" className="rounded-xl bg-electric-600 px-5 py-2.5 text-sm font-bold transition-colors hover:bg-electric-500">Get in touch</Link>
                <Link href="/solutions" className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold transition-colors hover:bg-white/20">Our solutions</Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section className="bg-mist-50 pt-14 pb-16">
          <Container>
            <h2 className="mb-8 font-display text-2xl font-bold text-navy-900">Keep reading</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 80}>
                  <Link href={`/resources/${r.slug}`} className="card-lift group block h-full rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
                    <p className="text-xs text-mist-500">{r.publishedAt ? formatDate(r.publishedAt) : ""}</p>
                    <h3 className="mt-2 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-electric-600">{r.title}</h3>
                    {r.excerpt ? <p className="mt-2 line-clamp-2 text-sm text-mist-600">{r.excerpt}</p> : null}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-electric-600 transition-all duration-200 group-hover:gap-2.5">
                      Read <Icon name="arrow-right" className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="pt-0">
        <Container>
          <CTABand headline="Have a question this didn't answer?" sub="Ask us directly — real questions get real answers." ctaHref="/contact" ctaLabel="Ask a question" />
        </Container>
      </Section>
    </>
  );
}
