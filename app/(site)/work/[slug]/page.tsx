import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container, Section, Badge } from "@/components/ui";
import { CTABand } from "@/components/site/CTABand";
import { getProjectBySlug } from "@/lib/queries";
import { getService } from "@/lib/constants";
import { publicFileUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not found" };
  return {
    title: `${project.title} — Case Study`,
    description: project.summary ?? `Case study: ${project.title}`,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const images = (
    await Promise.all(project.images.map(async (img) => ({ ...img, url: await publicFileUrl(img.storageKey) })))
  ).filter((i) => i.url);

  const blocks = [
    { label: "The problem", content: project.problem },
    { label: "What we built", content: project.solution },
    { label: "What was delivered", content: project.deliverables },
    { label: "Outcomes", content: project.results },
  ].filter((b) => b.content && b.content.trim().length > 0);

  return (
    <>
      <Section className="bg-navy-950 pb-14 pt-16 text-white">
        <Container>
          <Link href="/work" className="text-sm font-semibold text-mist-300 transition-colors hover:text-white">← All work</Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge tone="blue">{project.category ? getService(project.category)?.name ?? "Project" : "Project"}</Badge>
            {project.industry ? <span className="text-sm text-mist-300">{project.industry}</span> : null}
            {project.publishedAt ? <span className="text-sm text-mist-400">{formatDate(project.publishedAt)}</span> : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{project.title}</h1>
          {project.summary ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist-300">{project.summary}</p> : null}
          {(project.technologies ?? []).length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {(project.technologies ?? []).map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-mist-200">{t}</span>
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          {images.length > 0 ? (
            <div className="mb-12 grid gap-4 sm:grid-cols-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy-100 sm:col-span-2">
                <img src={images[0].url!} alt={images[0].alt ?? ""} className="h-full w-full object-cover" />
              </div>
              {images.slice(1, 5).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <div key={img.id} className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy-100">
                  <img src={img.url!} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mx-auto max-w-3xl">
            {project.description ? (
              <div className="article-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
              </div>
            ) : null}

            {blocks.length > 0 ? (
              <div className="mt-10 space-y-8">
                {blocks.map((b) => (
                  <section key={b.label}>
                    <h2 className="mb-3 flex items-center gap-2.5 font-display text-xl font-bold text-navy-900">
                      <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-electric-600 to-electric-400" aria-hidden />
                      {b.label}
                    </h2>
                    <div className="article-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.content ?? ""}</ReactMarkdown>
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            <div className="mt-12 flex flex-wrap gap-4 border-t border-mist-200 pt-8">
              {project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-800">
                  Visit live project ↗
                </a>
              ) : null}
              {project.externalUrl && project.externalUrl !== project.liveUrl ? (
                <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400">
                  Related link ↗
                </a>
              ) : null}
              <Link href="/start-a-project" className="rounded-xl bg-electric-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-electric-500">
                Start your own project
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <CTABand headline="Have a similar challenge?" sub="Talk to us about your project — we'll help you scope and price it." ctaHref="/contact" ctaLabel="Talk to us" />
        </Container>
      </Section>
    </>
  );
}
