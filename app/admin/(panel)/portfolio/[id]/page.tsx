import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, schema } from "@/lib/db/client";
import { PageHeader } from "@/components/admin/ui";
import { PortfolioEditor } from "@/components/admin/PortfolioEditor";
import { PortfolioStatusControl } from "@/components/admin/PortfolioStatusControl";
import { publicFileUrl } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit project", robots: { index: false } };

export default async function PortfolioEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const rows = await db.select().from(schema.portfolioProjects).where(eq(schema.portfolioProjects.id, id)).limit(1);
  if (!rows[0]) notFound();
  const project = rows[0];

  const images = await db.select().from(schema.projectImages).where(eq(schema.projectImages.projectId, id)).orderBy(asc(schema.projectImages.sortOrder));
  const imagesWithUrl = (await Promise.all(
    images.map(async (img) => ({ id: img.id, alt: img.alt, url: await publicFileUrl(img.storageKey) })),
  )).filter((i) => i.url) as Array<{ id: string; alt: string; url: string }>;

  return (
    <>
      <PageHeader
        title={`${project.title}`}
        description={`Created ${formatDateTime(project.createdAt)} · /portfolio/${project.slug}`}
        actions={
          project.status === "published" ? (
            <a href={`/portfolio/${project.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400">
              <Icon name="external" className="h-4 w-4" /> View live
            </a>
          ) : undefined
        }
      />

      <div className="mb-6">
        <PortfolioStatusControl projectId={project.id} status={project.status} />
      </div>

      <PortfolioEditor
        mode="edit"
        projectId={project.id}
        existingImages={imagesWithUrl}
        initial={{
          status: project.status,
          title: project.title,
          slug: project.slug,
          summary: project.summary ?? "",
          description: project.description ?? "",
          problem: project.problem ?? "",
          solution: project.solution ?? "",
          deliverables: project.deliverables ?? "",
          results: project.results ?? "",
          technologies: (project.technologies ?? []).join(", "),
          category: project.category ?? "",
          industry: project.industry ?? "",
          liveUrl: project.liveUrl ?? "",
          externalUrl: project.externalUrl ?? "",
          featured: project.featured,
        }}
      />
    </>
  );
}
