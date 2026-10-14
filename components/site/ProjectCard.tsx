import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { truncate } from "@/lib/utils";
import { publicFileUrl } from "@/lib/storage";

interface ProjectCardData {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  industry: string | null;
  technologies: string[] | null;
  images: Array<{ storageKey: string; alt: string | null }>;
}

export async function ProjectCard({ project }: { project: ProjectCardData }) {
  const cover = project.images[0];
  const coverUrl = cover ? await publicFileUrl(cover.storageKey) : null;

  return (
    <Link href={`/work/${project.slug}`} className="group block h-full" aria-label={`View case study: ${project.title}`}>
      <Card hover className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={cover?.alt ?? project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="bg-grid flex h-full items-center justify-center">
              <span className="font-display text-2xl font-bold text-white/25">{project.title.slice(0, 1)}</span>
            </div>
          )}
          {project.industry ? (
            <span className="absolute left-3 top-3"><Badge tone="blue" className="bg-navy-900/80 text-electric-200 ring-white/20 backdrop-blur">{project.industry}</Badge></span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-bold text-navy-900 transition-colors group-hover:text-electric-700">
            {project.title}
          </h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-mist-600">{truncate(project.summary, 140)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {(project.technologies ?? []).slice(0, 3).map((t) => (
              <span key={t} className="rounded-md bg-mist-100 px-2 py-0.5 text-[11px] font-medium text-mist-600">{t}</span>
            ))}
            {(project.technologies ?? []).length > 3 ? (
              <span className="text-[11px] text-mist-400">+{(project.technologies ?? []).length - 3}</span>
            ) : null}
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-600 transition-all group-hover:gap-2.5">
            View case study <Icon name="arrow-right" className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
